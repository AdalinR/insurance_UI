import { Component } from '@angular/core';
import { Router } from '@angular/router';
interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  standalone: false
})
export class ProductListComponent {
  selectedTemplate: string = '';
  products = [
    {
      id: 1, name: 'Product A',
      type: 'type 1',
      description: 'Description of Product A',
      sectionName: 'Section 1',
      status: 'Active',
      templateName: 'Insurance Product',
      templateId: 'ABC-007',
      templateVersion: '1.0',
      templateStatus: 'Draft',
    },
  ]
  cols!: Column[];
  constructor(private router: Router
  ) {
    this.cols = [
      { field: 'name', header: 'Product Name' },
      { field: 'type', header: 'Type' },
      { field: 'description', header: 'Description' },
      { field: 'sectionName', header: 'Section Name' },
      { field: 'status', header: 'Status' },
      { field: 'templateName', header: 'Template Name' },
      { field: 'templateId', header: 'Template ID' },
      { field: 'templateVersion', header: 'Template Version' },
      { field: 'templateStatus', header: 'Template Status' }
    ];
  }
  ngoOnInit(): void {

  }
  editProduct(product: any) {
    this.router.navigate(['/template']);
    sessionStorage.setItem('product', JSON.stringify(product));
  }
  newTempplate(templateValue: string) {
    this.router.navigate(['/template']);
    const prodcutDetails = JSON.parse(sessionStorage.getItem('product') || '{}');
    prodcutDetails['name'] = templateValue;
    sessionStorage.setItem('product', JSON.stringify(prodcutDetails));
  }
}