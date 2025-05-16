import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateNode, Connection } from '../../models/template-node.model';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-template-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas" #canvas>
      <svg class="connections-layer" #connectionsLayer>
        <g *ngFor="let conn of connections">
          <path 
            [attr.d]="getConnectionPath(conn)"
            class="connection-line"
            [class.active]="isConnectionActive(conn)"
          ></path>
        </g>
      </svg>
      
      <div
        *ngFor="let node of nodes"
        class="node-item"
        [class.selected]="selectedNodeId === node.id"
        [ngClass]="'node-' + node.type"
        [style.left.px]="node.x"
        [style.top.px]="node.y"
        cdkDrag
        (click)="onNodeClick(node, $event)"
      >
        <div class="node-header">{{ node.label }}</div>
        <div class="node-content" *ngIf="node.properties">
          <div *ngFor="let prop of getNodeProperties(node)" class="node-property">
            {{ prop.key }}: {{ prop.value }}
          </div>
        </div>
        <div class="node-connector top"></div>
        <div class="node-connector bottom"></div>
      </div>
    </div>
  `,
  styles: [`
    .canvas {
      position: relative;
      width: 3000px;
      height: 2000px;
      padding: 40px;
    }
    
    .connections-layer {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .connection-line {
      stroke: var(--neutral-300);
      stroke-width: 2px;
      fill: none;
      transition: stroke 0.2s ease;
    }
    
    .connection-line.active {
      stroke: var(--primary-500);
    }
    
    .node-item {
      position: absolute;
      width: 200px;
      border-radius: var(--radius);
      background-color: white;
      box-shadow: var(--shadow);
      cursor: move;
      z-index: 2;
      transition: box-shadow 0.2s ease;
    }
    
    .node-item:hover {
      box-shadow: var(--shadow-md);
    }
    
    .node-item.selected {
      box-shadow: 0 0 0 2px var(--primary-500), var(--shadow-md);
    }
    
    .node-header {
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius) var(--radius) 0 0;
      font-weight: 500;
      color: white;
    }
    
    .node-content {
      padding: var(--space-2) var(--space-3);
      font-size: 12px;
      color: var(--neutral-700);
    }
    
    .node-property {
      margin-bottom: var(--space-1);
    }
    
    .node-connector {
      position: absolute;
      width: 12px;
      height: 12px;
      background-color: var(--neutral-400);
      border-radius: 50%;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    
    .node-connector.top {
      top: -6px;
    }
    
    .node-connector.bottom {
      bottom: -6px;
    }
    
    .node-item:hover .node-connector {
      background-color: var(--primary-500);
    }
    
    /* Node type styles */
    .node-policy .node-header {
      background-color: var(--policy-color);
    }
    
    .node-plan .node-header {
      background-color: var(--plan-color);
    }
    
    .node-benefitType .node-header {
      background-color: var(--benefit-color);
    }
    
    .node-unitPrice .node-header {
      background-color: var(--unit-price-color);
    }
    
    .node-bonus .node-header {
      background-color: var(--bonus-color);
    }
    
    .node-durationLimit .node-header {
      background-color: var(--secondary-600);
    }
    
    .node-deductible .node-header {
      background-color: var(--error-500);
    }
    
    .node-payment .node-header {
      background-color: var(--primary-400);
    }
    
    .node-copayment .node-header {
      background-color: var(--secondary-400);
    }
    
    .node-procedureLimit .node-header {
      background-color: var(--secondary-600);
    }
    
    .node-claimsLimit .node-header {
      background-color: var(--warning-500);
    }
    
    .node-premiumAdjustment .node-header {
      background-color: var(--unit-price-color);
    }
  `]
})
export class TemplateCanvasComponent implements OnChanges, AfterViewInit {
  @Input() nodes: TemplateNode[] = [];
  @Input() connections: Connection[] = [];
  @Output() nodeSelected = new EventEmitter<TemplateNode | null>();
  @Output() nodePositionChanged = new EventEmitter<TemplateNode>();
  
  @ViewChild('canvas') canvasRef!: ElementRef;
  @ViewChild('connectionsLayer') connectionsLayerRef!: ElementRef;
  
  selectedNodeId: string | null = null;
  private readonly VERTICAL_SPACING = 100;
  private readonly HORIZONTAL_SPACING = 250;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnChanges(changes: SimpleChanges) {
    if ((changes['nodes'] || changes['connections']) && this.connectionsLayerRef) {
      this.updateNodePositions();
      this.updateConnections();
      this.cdr.detectChanges();
    }
  }
  
  ngAfterViewInit() {
    this.cdr.detach();
    this.updateNodePositions();
    this.updateConnections();
    this.cdr.detectChanges();
  }
  
  onNodeClick(node: TemplateNode, event: MouseEvent) {
    event.stopPropagation();
    this.selectedNodeId = node.id;
    this.nodeSelected.emit(node);
    this.cdr.detectChanges();
  }
  
  onDragEnded(event: CdkDragEnd, node: TemplateNode) {
    const position = event.source.getFreeDragPosition();
    const updatedNode: TemplateNode = {
      ...node,
      x: position.x,
      y: position.y
    };
    
    this.nodePositionChanged.emit(updatedNode);
    this.updateConnections();
    this.cdr.detectChanges();
  }
  
  private updateNodePositions() {
    const rootNodes = this.nodes.filter(node => !node.parentId);
    let currentX = 40;
    let currentY = 40;
    
    rootNodes.forEach(rootNode => {
      this.positionNodeAndChildren(rootNode, currentX, currentY);
      currentX += this.HORIZONTAL_SPACING;
    });
  }
  
  private positionNodeAndChildren(node: TemplateNode, x: number, y: number) {
    // Update node position
    node.x = x;
    node.y = y;
    
    // Find children
    const children = this.nodes.filter(n => n.parentId === node.id);
    const totalWidth = (children.length - 1) * this.HORIZONTAL_SPACING;
    let childX = x - totalWidth / 2;
    
    children.forEach(child => {
      this.positionNodeAndChildren(child, childX, y + this.VERTICAL_SPACING);
      childX += this.HORIZONTAL_SPACING;
    });
  }
  
  getConnectionPath(connection: Connection): string {
    const sourceNode = this.nodes.find(n => n.id === connection.source);
    const targetNode = this.nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) {
      return '';
    }
    
    const sourceX = (sourceNode.x || 0) + 100; // Center of node
    const sourceY = (sourceNode.y || 0) + 40; // Bottom of source node
    const targetX = (targetNode.x || 0) + 100; // Center of node
    const targetY = (targetNode.y || 0); // Top of target node
    
    const midY = sourceY + (targetY - sourceY) / 2;
    
    return `
      M ${sourceX} ${sourceY}
      L ${sourceX} ${midY}
      L ${targetX} ${midY}
      L ${targetX} ${targetY}
    `;
  }
  
  isConnectionActive(connection: Connection): boolean {
    return connection.source === this.selectedNodeId || connection.target === this.selectedNodeId;
  }
  
  getNodeProperties(node: TemplateNode): {key: string, value: string}[] {
    if (!node.properties) {
      return [];
    }
    
    return Object.entries(node.properties).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : value.toString()
    }));
  }
  
  private updateConnections() {
    // Handled by manual change detection
    this.cdr.detectChanges();
  }
}