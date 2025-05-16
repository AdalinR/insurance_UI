import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateNode, NodeType, CURRENCIES } from '../../models/template-node.model';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="properties-panel">
      <div class="panel-header">
        <ng-container *ngIf="selectedNode; else noSelection">
          <h3>{{ selectedNode.label }}</h3>
          <p class="panel-subtitle">Edit {{ getNodeTypeName(selectedNode.type) }} properties</p>
        </ng-container>
        <ng-template #noSelection>
          <h3>Properties</h3>
          <p class="panel-subtitle">Select a component to edit properties</p>
        </ng-template>
      </div>
      
      <div class="panel-content" *ngIf="selectedNode">
        <div class="property-group">
          <label>Component Name</label>
          <input 
            type="text" 
            [(ngModel)]="tempNode.label" 
            (change)="updateNode()"
          >
        </div>
        
        <!-- Policy specific properties -->
        <ng-container *ngIf="selectedNode.type === 'policy'">
          <div class="property-group">
            <label>Policy Type</label>
            <select [(ngModel)]="tempProperties['policyType']" (change)="updateProperties()">
              <option value="health">Health Insurance</option>
              <option value="life">Life Insurance</option>
              <option value="auto">Auto Insurance</option>
              <option value="property">Property Insurance</option>
            </select>
          </div>
        </ng-container>
        
        <!-- Benefit Type specific properties -->
        <ng-container *ngIf="selectedNode.type === 'benefitType'">
          <div class="property-group">
            <label>Inpatient</label>
            <div class="toggle-control">
              <input 
                type="checkbox" 
                id="inpatient" 
                [(ngModel)]="tempProperties['inpatient']" 
                (change)="updateProperties()"
              >
              <label for="inpatient" class="toggle-label"></label>
            </div>
          </div>
          
          <div class="property-group">
            <label>Outpatient</label>
            <div class="toggle-control">
              <input 
                type="checkbox" 
                id="outpatient" 
                [(ngModel)]="tempProperties['outpatient']" 
                (change)="updateProperties()"
              >
              <label for="outpatient" class="toggle-label"></label>
            </div>
          </div>
        </ng-container>
        
        <!-- Unit Price specific properties -->
        <ng-container *ngIf="selectedNode.type === 'unitPrice'">
          <div class="property-group">
            <label>Currency</label>
            <select [(ngModel)]="tempProperties['currency']" (change)="updateProperties()">
              <option *ngFor="let currency of currencies" [value]="currency.code">
                {{ currency.code }} - {{ currency.name }}
              </option>
            </select>
          </div>
          
          <div class="property-group">
            <label>Amount</label>
            <input 
              type="number" 
              [(ngModel)]="tempProperties['amount']" 
              (change)="updateProperties()"
            >
          </div>
        </ng-container>
        
        <!-- Common actions -->
        <div class="property-actions">
          <button class="btn-outline" (click)="deleteNode()">
            <span class="material-icons">delete</span> Delete
          </button>
        </div>
      </div>
      
      <div class="panel-content empty-state" *ngIf="!selectedNode">
        <div class="empty-state-icon">
          <span class="material-icons">touch_app</span>
        </div>
        <p>Select a component from the canvas to edit its properties</p>
      </div>
    </div>
  `,
  styles: [`
    .properties-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .panel-header {
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .panel-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--neutral-800);
      margin-bottom: var(--space-1);
    }
    
    .panel-subtitle {
      font-size: 12px;
      color: var(--neutral-500);
    }
    
    .panel-content {
      flex: 1;
      padding: var(--space-4);
      overflow-y: auto;
    }
    
    .property-group {
      margin-bottom: var(--space-4);
    }
    
    .property-group label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: var(--space-2);
      color: var(--neutral-700);
    }
    
    .toggle-control {
      position: relative;
      display: inline-block;
    }
    
    .toggle-control input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .toggle-label {
      position: relative;
      display: inline-block;
      width: 48px;
      height: 24px;
      background-color: var(--neutral-300);
      border-radius: 24px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .toggle-label:after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: white;
      top: 2px;
      left: 2px;
      transition: all 0.2s ease;
    }
    
    input:checked + .toggle-label {
      background-color: var(--primary-500);
    }
    
    input:checked + .toggle-label:after {
      transform: translateX(24px);
    }
    
    .property-actions {
      margin-top: var(--space-6);
      display: flex;
      justify-content: flex-end;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--space-8);
      color: var(--neutral-500);
    }
    
    .empty-state-icon {
      font-size: 48px;
      margin-bottom: var(--space-4);
      color: var(--neutral-400);
    }
    
    .empty-state p {
      max-width: 200px;
    }
  `]
})
export class PropertiesPanelComponent implements OnChanges {
  @Input() selectedNode: TemplateNode | null = null;
  @Output() nodeUpdated = new EventEmitter<TemplateNode>();
  @Output() nodeDeleted = new EventEmitter<string>();
  
  tempNode: TemplateNode = { id: '', type: NodeType.POLICY, label: '' };
  tempProperties: Record<string, any> = {};
  currencies = CURRENCIES;
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedNode'] && this.selectedNode) {
      this.tempNode = { ...this.selectedNode };
      this.tempProperties = this.selectedNode.properties ? { ...this.selectedNode.properties } : {};
    }
  }
  
  updateNode() {
    if (!this.selectedNode) return;
    
    const updatedNode: TemplateNode = {
      ...this.tempNode,
      properties: this.tempProperties
    };
    
    this.nodeUpdated.emit(updatedNode);
  }
  
  updateProperties() {
    if (!this.selectedNode) return;
    
    this.updateNode();
  }
  
  deleteNode() {
    if (!this.selectedNode) return;
    
    if (confirm(`Are you sure you want to delete "${this.selectedNode.label}"?`)) {
      this.nodeDeleted.emit(this.selectedNode.id);
    }
  }
  
  getNodeTypeName(type: NodeType): string {
    switch (type) {
      case NodeType.POLICY: return 'Policy';
      case NodeType.PLAN: return 'Plan';
      case NodeType.BENEFIT_TYPE: return 'Benefit Type';
      case NodeType.UNIT_PRICE: return 'Unit Price';
      case NodeType.BONUS: return 'Bonus & Benefit';
      case NodeType.DURATION_LIMIT: return 'Duration Limit';
      case NodeType.DEDUCTIBLE: return 'Deductible';
      case NodeType.PAYMENT: return 'Payment';
      case NodeType.COPAYMENT: return 'Copayment';
      case NodeType.PROCEDURE_LIMIT: return 'Procedure Limit';
      case NodeType.CLAIMS_LIMIT: return 'Claims Limit';
      case NodeType.PREMIUM_ADJUSTMENT: return 'Premium Adjustment';
      case NodeType.PROVIDER_RATE: return 'Provider Rate';
      case NodeType.POOLED_BENEFIT: return 'Pooled Benefit';
      default: return 'Component';
    }
  }
}