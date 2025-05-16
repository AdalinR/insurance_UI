import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ChartConfiguration, ChartDataset, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styles: [`
.dashboard-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card {
  background: #fff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-card {
  grid-column: span 2;
}

.highlight {
  font-size: 24px;
  font-weight: bold;
  color: teal;
}

.btn {
  background-color: teal;
  color: #fff;
  border: none;
  padding: 8px 12px;
  margin-top: 10px;
  cursor: pointer;
  border-radius: 4px;
}


.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  float: right;
}

.user-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-weight: 600;
  font-size: 16px;
}

  `]
})
export class HomeComponent {
  constructor(private authService: AuthService) {}
  lineChartData: ChartConfiguration['data']['datasets'] = [
    {
      data: [65, 59, 80, 81, 56, 55, 40],
      label: 'Series A',
    },
  ];

  lineChartLabels: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

  lineChartLegend = true;
  lineChartType: ChartType = 'line';
}