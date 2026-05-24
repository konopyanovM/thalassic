import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Layout } from '../../components/layout/layout';

@Component({
  selector: 'app-info',
  imports: [Layout, FormsModule],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {}
