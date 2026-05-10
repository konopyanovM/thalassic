import { Component, signal } from '@angular/core';
import { Step, Stepper } from '@thalassic/ui';
import { Layout } from '../../components/layout/layout';

@Component({
  selector: 'app-info',
  imports: [Layout, Stepper, Step],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {
  protected activeStep = signal<any>(null);
}
