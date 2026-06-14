import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  isDevMode,
  OnDestroy,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Point } from '@thalassic/core';
import { filter } from 'rxjs';
import { overlayPosition } from '../../types';
import { buildOverlayPositions } from '../../utils';
import { Icon } from '../icon';
import { MenuItemComponent } from './menu-item';
import { MENU_CONFIG } from './menu.token';
import { MenuActionItem, MenuItemDefinition } from './menu.types';

@Component({
  selector: 'tls-menu',
  imports: [NgTemplateOutlet, Icon],
  templateUrl: './menu.html',
})
export class Menu implements OnInit, OnDestroy {
  private static _counter = 0;

  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _config = inject(MENU_CONFIG);

  private _overlayRef: OverlayRef | null = null;

  private readonly _panelRef = viewChild.required<TemplateRef<unknown>>('panel');
  private readonly _isOpen = signal(false);

  protected readonly _customItems = contentChildren(MenuItemComponent);
  protected readonly customTemplates = computed(() => {
    const map = new Map<string, TemplateRef<unknown>>();
    for (const item of this._customItems()) {
      map.set(item.key(), item.templateRef());
    }
    return map;
  });

  protected readonly itemTemplate = contentChild<TemplateRef<unknown>>('itemTemplate');
  protected readonly labelTemplate = contentChild<TemplateRef<unknown>>('labelTemplate');
  protected readonly dividerTemplate = contentChild<TemplateRef<unknown>>('dividerTemplate');
  protected readonly iconTemplate = contentChild<TemplateRef<unknown>>('iconTemplate');

  public readonly id = `tls-menu-${++Menu._counter}`;
  public readonly isOpen = this._isOpen.asReadonly();

  // Inputs
  public readonly items: InputSignal<MenuItemDefinition[]> = input<MenuItemDefinition[]>([]);
  public readonly position: InputSignal<overlayPosition> = input<overlayPosition>(
    this._config.position,
  );
  public readonly offset: InputSignal<Point> = input<Point>(this._config.offset);
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly inline: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  private readonly _positions = computed<ConnectedPosition[]>(() =>
    buildOverlayPositions(this.position(), this.offset()),
  );

  constructor() {
    if (isDevMode()) {
      effect(() => {
        const templates = this.customTemplates();
        for (const item of this.items()) {
          if (item.type === 'custom' && !templates.has(item.key)) {
            console.warn(
              `[tls-menu] No <tls-menu-item key="${item.key}"> found for custom item. The slot will be skipped.`,
            );
          }
        }
      });
    }
  }

  ngOnInit(): void {
    if (this.inline()) {
      this._isOpen.set(true);
    }
  }

  // Public methods
  public open(trigger: MouseEvent | HTMLElement): void {
    if (this._overlayRef || this.inline()) return;

    const origin: FlexibleConnectedPositionStrategyOrigin =
      trigger instanceof MouseEvent ? (trigger.currentTarget as HTMLElement) : trigger;

    this._attach(
      this._overlay.position().flexibleConnectedTo(origin).withPositions(this._positions()),
      this._overlay.scrollStrategies.reposition(),
      true,
    );
  }

  public openAtPoint(x: number, y: number): void {
    if (this._overlayRef || this.inline()) return;

    this._attach(
      this._overlay.position().flexibleConnectedTo({ x, y }).withPositions(this._positions()),
      this._overlay.scrollStrategies.close(),
      false,
    );
  }

  public close(): void {
    if (!this._overlayRef) return;
    this._overlayRef.dispose();
    this._overlayRef = null;
    this._isOpen.set(false);
  }

  public toggle(trigger: MouseEvent | HTMLElement): void {
    if (this._overlayRef) {
      this.close();
    } else {
      this.open(trigger);
    }
  }

  // Protected
  protected onItemClick(item: MenuActionItem): void {
    item.action?.();
    this.close();
  }

  // Private
  private _attach(
    positionStrategy: FlexibleConnectedPositionStrategy,
    scrollStrategy: ScrollStrategy,
    hasBackdrop = true,
  ): void {
    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy,
      hasBackdrop,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });

    if (hasBackdrop) {
      this._overlayRef
        .backdropClick()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this.close());
    } else {
      this._overlayRef
        .outsidePointerEvents()
        .pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(event => event.type === 'click' || event.type === 'auxclick'),
        )
        .subscribe(() => this.close());
    }

    this._overlayRef
      .keydownEvents()
      .pipe(
        takeUntilDestroyed(this._destroyRef),
        filter(event => event.key === 'Escape'),
      )
      .subscribe(() => this.close());

    this._overlayRef.attach(new TemplatePortal(this._panelRef(), this._viewContainerRef));
    this._isOpen.set(true);
  }

  // Lifecycle
  ngOnDestroy(): void {
    if (this._overlayRef) this._overlayRef.dispose();
  }
}
