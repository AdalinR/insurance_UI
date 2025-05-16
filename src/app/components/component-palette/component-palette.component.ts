import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NodeType } from '../../models/template-node.model';

interface PaletteCategory {
  name: string;
  expanded: boolean;
  components: PaletteComponent[];
}

interface PaletteComponent {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-component-palette',
  template: ``,
  styles: [`
    .component-palette {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .palette-header {
      padding: var(--space-4);
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .palette-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--neutral-800);
    }
    
    .palette-content {
      flex: 1;
      overflow-y: auto;
    }
    
    .component-category {
      border-bottom: 1px solid var(--neutral-200);
    }
    
    .category-header {
      display: flex;
      align-items: center;
      padding: var(--space-3) var(--space-4);
      cursor: pointer;
    }
    
    .category-header h4 {
      font-size: 14px;
      font-weight: 500;
      margin-left: var(--space-2);
    }
    
    .category-components {
      padding: var(--space-2) var(--space-4);
    }
    
    .palette-component {
      display: flex;
      align-items: center;
      margin-bottom: var(--space-2);
      padding: var(--space-2);
      border-radius: var(--radius);
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .palette-component:hover {
      background-color: var(--neutral-100);
    }
    
    .component-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--radius);
      background-color: var(--primary-100);
      color: var(--primary-700);
      margin-right: var(--space-3);
    }
    
    .component-info {
      flex: 1;
    }
    
    .component-label {
      font-size: 13px;
      font-weight: 500;
    }
    
    .component-description {
      font-size: 11px;
      color: var(--neutral-500);
    }
    
    /* Drag preview customization */
    .cdk-drag-preview.palette-component {
      box-sizing: border-box;
      border-radius: var(--radius);
      box-shadow: var(--shadow-lg);
      opacity: 0.8;
      background-color: white;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule
  ]})
export class ComponentPaletteComponent {
  @Output() componentSelected = new EventEmitter<NodeType>();
  
  categories: PaletteCategory[] = [
    {
      name: 'Policy Structure',
      expanded: true,
      components: [
        {
          type: NodeType.POLICY,
          label: 'Policy Template',
          description: 'Top-level policy container',
          icon: 'article'
        },
        {
          type: NodeType.PLAN,
          label: 'Plan',
          description: 'Insurance plan definition',
          icon: 'account_balance'
        }
      ]
    },
    {
      name: 'Benefits',
      expanded: true,
      components: [
        {
          type: NodeType.BENEFIT_TYPE,
          label: 'Benefit Type',
          description: 'Define a type of insurance benefit',
          icon: 'medical_services'
        },
        {
          type: NodeType.UNIT_PRICE,
          label: 'Unit Price',
          description: 'Price per unit for a benefit',
          icon: 'attach_money'
        },
        {
          type: NodeType.BONUS,
          label: 'Bonus & Benefit',
          description: 'Additional benefit or bonus',
          icon: 'card_giftcard'
        }
      ]
    },
    {
      name: 'Limits & Deductibles',
      expanded: true,
      components: [
        {
          type: NodeType.DURATION_LIMIT,
          label: 'Duration Limit',
          description: 'Time-based limits for benefits',
          icon: 'timer'
        },
        {
          type: NodeType.DEDUCTIBLE,
          label: 'Deductible',
          description: 'Amount paid before insurance applies',
          icon: 'remove_circle'
        },
        {
          type: NodeType.PROCEDURE_LIMIT,
          label: 'Procedure Limit',
          description: 'Limits on specific procedures',
          icon: 'block'
        },
        {
          type: NodeType.CLAIMS_LIMIT,
          label: 'Claims Limit',
          description: 'Maximum number of allowed claims',
          icon: 'rule'
        }
      ]
    },
    {
      name: 'Payments',
      expanded: true,
      components: [
        {
          type: NodeType.PAYMENT,
          label: 'Payment',
          description: 'Payment structure and details',
          icon: 'payments'
        },
        {
          type: NodeType.COPAYMENT,
          label: 'Copayment',
          description: 'Fixed payment amount for a service',
          icon: 'request_quote'
        },
        {
          type: NodeType.PREMIUM_ADJUSTMENT,
          label: 'Premium Adjustment',
          description: 'Adjustments to premium calculations',
          icon: 'trending_up'
        }
      ]
    },
    {
      name: 'Provider Network',
      expanded: false,
      components: [
        {
          type: NodeType.PROVIDER_RATE,
          label: 'Provider Rate',
          description: 'Negotiated rates with providers',
          icon: 'local_hospital'
        },
        {
          type: NodeType.POOLED_BENEFIT,
          label: 'Pooled Benefit',
          description: 'Benefits shared across a provider pool',
          icon: 'groups'
        }
      ]
    }
  ];
  
  selectComponent(type: NodeType) {
    this.componentSelected.emit(type);
  }
}