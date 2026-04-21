import { Component } from '@angular/core';
import {
  BarChart,
  BubbleChart,
  Chart,
  DoughnutChart,
  LineChart,
  PieChart,
  PolarAreaChart,
  RadarChart,
  ScatterChart,
} from '@thalassic/ui';
import { ChartData, ChartDataset } from 'chart.js';
import { Layout } from '../../components/layout/layout';

@Component({
  selector: 'app-info',
  imports: [
    Layout,
    Chart,
    RadarChart,
    LineChart,
    BarChart,
    BubbleChart,
    DoughnutChart,
    PieChart,
    PolarAreaChart,
    ScatterChart,
  ],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {
  public data: ChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        type: 'line',
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: 'rgb(75, 192, 192)',
      },
      {
        type: 'pie',
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: 'rgb(75, 192, 192)',
      },
    ],
  };

  public labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  public dataset: ChartDataset<'line'> = {
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    borderColor: 'rgb(75, 192, 192)',
  };

  public datasetbar: ChartDataset<'bar'> = {
    label: 'My First Dataset',
    data: [65, 59, 80, 81, 56, 55, 40],
    backgroundColor: [
      'rgba(255, 99, 132, 0.2)',
      'rgba(255, 159, 64, 0.2)',
      'rgba(255, 205, 86, 0.2)',
      'rgba(75, 192, 192, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(201, 203, 207, 0.2)',
    ],
    borderColor: [
      'rgb(255, 99, 132)',
      'rgb(255, 159, 64)',
      'rgb(255, 205, 86)',
      'rgb(75, 192, 192)',
      'rgb(54, 162, 235)',
      'rgb(153, 102, 255)',
      'rgb(201, 203, 207)',
    ],
    borderWidth: 1,
  };
  public datasetBubble: ChartDataset<'bubble'> = {
    label: 'First Dataset',
    data: [
      { x: 20, y: 30, r: 15 },
      { x: 40, y: 10, r: 10 },
    ],
    backgroundColor: 'rgb(255, 99, 132)',
  };
  public datasetDoughnut: ChartDataset<'doughnut'> = {
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
    hoverOffset: 4,
  };

  public datasetPie: ChartDataset<'pie'> = {
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
    hoverOffset: 4,
  };

  public datasetPolarArea: ChartDataset<'polarArea'> = {
    label: 'My First Dataset',
    data: [11, 16, 7, 3, 14],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(75, 192, 192)',
      'rgb(255, 205, 86)',
      'rgb(201, 203, 207)',
      'rgb(54, 162, 235)',
    ],
  };

  public datasetRadar: ChartDataset<'radar'> = {
    label: 'My First Dataset',
    data: [65, 59, 90, 81, 56, 55, 40],
    fill: true,
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    borderColor: 'rgb(255, 99, 132)',
    pointBackgroundColor: 'rgb(255, 99, 132)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgb(255, 99, 132)',
  };

  public datasetScatter: ChartDataset<'scatter'> = {
    label: 'Scatter Dataset',
    data: [
      { x: -10, y: 0 },
      { x: 0, y: 10 },
      { x: 10, y: 5 },
      { x: 0.5, y: 5.5 },
    ],
    backgroundColor: 'rgb(255, 99, 132)',
  };
}
