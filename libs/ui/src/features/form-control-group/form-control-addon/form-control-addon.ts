import { Component } from '@angular/core';

@Component({
  selector: 'tls-form-control-addon',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    class: 'tls-form-control-addon',
  },
})
export class FormControlAddon {}
