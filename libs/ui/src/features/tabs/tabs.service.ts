import { Injectable, Signal } from '@angular/core';
import { tabValue } from './tabs.types';

@Injectable()
export class TabsService {
  public selected: Signal<tabValue | null> | null = null;
}
