import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
// Policy Node Interface
export interface PolicyNode {
  id: string;        // Unique identifier
  type: string;      // Type of node (plan, benefit-type, etc.)
  label: string;     // Display label
  color: string;     // Color for styling
  placeholder?: string; // Optional placeholder text
  children: string[]; // Array of child node IDs
  position?: {       // Position on canvas
    x: number;
    y: number;
  };
  formData?: any;    // Form data associated with this node
}

// Sample component implementation with fixes
@Component({
  selector: 'app-template-builder',
  templateUrl: './template-builder.component.html',
  styleUrls: ['./template-builder.component.scss'],
  standalone: false
})
export class TemplateBuilderComponent implements OnInit, AfterViewInit {
  // Component properties
  activeTab = 'elements';
  showFormModal = false;
  currentFormNode: PolicyNode | null = null;
  rootNodeId: string | null = null;
  selectedNode: string | null = null;
  treeNodes: { [key: string]: PolicyNode } = {};

  // Available nodes for dragging
  availableNodes: PolicyNode[] = [
    { id: 'plan-template', type: 'plan', label: 'Plan', color: '#0052cc', children: [], placeholder: '---' },
    { id: 'benefit-type-template', type: 'benefit-type', label: 'Benefit Type', color: '#00875a', children: [], placeholder: '---' },
    { id: 'unit-price-template', type: 'unit-price', label: 'Unit Price', color: '#8f00ff', children: [], placeholder: '---' },
    { id: 'benefits-template', type: 'benefits', label: 'Benefits', color: '#00875a', children: [], placeholder: '---' }
  ];

  // Available insurance components for dragging
  availableInsuranceNodes: PolicyNode[] = [
    { id: 'sum-insured-template', type: 'limit', label: 'Sum Insured', color: '#e60000', children: [], placeholder: '---' },
    { id: 'retail-limit-template', type: 'retail-limit', label: 'Retail Limit', color: '#e60000', children: [], placeholder: '---' },
    { id: 'duration-limit-template', type: 'duration-limit', label: 'Duration Limit', color: '#e60000', children: [], placeholder: '---' },
    { id: 'deductible-template', type: 'deductible', label: 'Deductible', color: '#e60000', children: [], placeholder: '---' },
    { id: 'copayment-template', type: 'copayment', label: 'Co-payment', color: '#e60000', children: [], placeholder: '---' }
  ];
  templateName = 'Insurance Product';
  templateId = 'ABC-007';
  templateVersion = '1.0';
  templateStatus = 'draft';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Initialize component
  }

  ngAfterViewInit(): void {
    // Force update of view after initialization
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  // Method to set the active tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Method to get styling for a node
  getNodeStyle(node: PolicyNode): any {
    return {
      'background-color': node.color || '#f5f5f5',
      'color': this.getContrastTextColor(node.color || '#f5f5f5'),
      'border': '1px solid #ddd',
      'border-radius': '4px',
      'padding': '10px',
      'margin-bottom': '8px',
      'cursor': 'grab',
      'user-select': 'none'
    };
  }

  // Helper method to get contrasting text color
  getContrastTextColor(bgColor: string): string {
    // Simple calculation to determine if text should be white or black
    const rgb = this.hexToRgb(bgColor);
    if (!rgb) return '#000000';

    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 125 ? '#000000' : '#ffffff';
  }

  // Convert hex color to RGB
  hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Method called when drag starts
  onDragStart(event: DragEvent, nodeType: string): void {
    if (event.dataTransfer) {
      event.dataTransfer.setData('nodeType', nodeType);
    }
  }

  // Method to allow dropping
  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  // Method called when a node is dropped
  onDrop(event: DragEvent, parentId?: string): void {
    event.preventDefault();
    if (!event.dataTransfer) return;

    const nodeType = event.dataTransfer.getData('nodeType');

    // Create a new node
    const newNodeId = this.generateId();
    const templateNode = this.findTemplateNodeByType(nodeType);

    if (!templateNode) return;

    const newNode: PolicyNode = {
      id: newNodeId,
      type: templateNode.type,
      label: templateNode.label,
      color: templateNode.color,
      children: [],
      position: {
        x: event.offsetX,
        y: event.offsetY
      }
    };

    // Add to tree nodes
    this.treeNodes[newNodeId] = newNode;

    // If parent is specified, add as child
    if (parentId && this.treeNodes[parentId]) {
      this.treeNodes[parentId].children.push(newNodeId);
    } else if (!this.rootNodeId) {
      // If no root exists, set as root
      this.rootNodeId = newNodeId;
    }

    // Update view
    this.cdr.detectChanges();
  }

  // Find a template node by type
  findTemplateNodeByType(type: string): PolicyNode | undefined {
    return [...this.availableNodes, ...this.availableInsuranceNodes]
      .find(node => node.type === type);
  }

  // Generate a unique ID
  generateId(): string {
    return 'node-' + Math.random().toString(36).substr(2, 9);
  }

  // Method to get the path between nodes for SVG connection
  getPathBetweenNodes(parentId: string, childId: string): string {
    // Get nodes
    const parent = this.treeNodes[parentId];
    const child = this.treeNodes[childId];

    if (!parent || !child || !parent.position || !child.position) {
      return '';
    }

    // Calculate points with proper control points for a nice curve
    const startX = parent.position.x + 100;
    const startY = parent.position.y + 30;
    const endX = child.position.x;
    const endY = child.position.y + 30;

    const controlPointDistance = 80;
    const cp1x = startX + controlPointDistance;
    const cp1y = startY;
    const cp2x = endX - controlPointDistance;
    const cp2y = endY;

    // Return SVG path with cubic bezier curve
    return `M${startX},${startY} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`;
  }
  // Method called when node is dragged
  onNodeDragEnd(event: CdkDragEnd, nodeId: string): void {
    if (!event.source || !event.source.element) return;

    const element = event.source.element.nativeElement;
    const canvas = element.closest('.canvas');

    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Calculate position relative to canvas
    const x = elementRect.left - canvasRect.left;
    const y = elementRect.top - canvasRect.top;

    // Update node position
    if (this.treeNodes[nodeId]) {
      this.treeNodes[nodeId].position = { x, y };
      this.cdr.detectChanges();
    }
  }
  // Method to open the node form modal
  openNodeForm(nodeId: string): void {
    console.log('Opening form for node:', nodeId, this.treeNodes);

    this.selectedNode = nodeId;
    this.currentFormNode = this.treeNodes[nodeId];

    if (!this.currentFormNode.formData) {
      this.initFormData(this.currentFormNode);
    }
    this.showFormModal = true;
  }

  // Initialize form data for a node
  initFormData(node: PolicyNode): void {
    if (!node.formData) {
      node.formData = {
        description: '',
        name: '',
        limitType: '',
        amount: 0,
        unit: 'days',
        duration: 90
      };

      // Initialize specific properties based on node type
      if (node.type === 'duration-limit') {
        node.formData.unit = 'days';
        node.formData.duration = 90;
      }
    }
  }

  // Save node form data
  saveNodeForm(formData: any): void {
    console.log('Form Data:', formData);
    this.showFormModal = false;
    this.currentFormNode = null;
    this.cdr.detectChanges();
  }

  // Cancel node form
  cancelNodeForm(): void {
    this.showFormModal = false;
    this.currentFormNode = null;
  }

  // Remove a node
  removeNode(nodeId: string): void {
    if (!nodeId || !this.treeNodes[nodeId]) return;

    // Remove node from parent's children array
    Object.keys(this.treeNodes).forEach(id => {
      const children = this.treeNodes[id].children;
      const index = children.indexOf(nodeId);
      if (index > -1) {
        children.splice(index, 1);
      }
    });

    // If removing root node, update rootNodeId
    if (this.rootNodeId === nodeId) {
      this.rootNodeId = null;
    }

    // Delete node and its children recursively
    this.deleteNodeRecursive(nodeId);

    this.showFormModal = false;
    this.currentFormNode = null;
    this.cdr.detectChanges();
  }

  // Helper method to delete a node and its children recursively
  deleteNodeRecursive(nodeId: string): void {
    if (!this.treeNodes[nodeId]) return;

    // Delete children first
    [...this.treeNodes[nodeId].children].forEach(childId => {
      this.deleteNodeRecursive(childId);
    });

    // Delete the node itself
    delete this.treeNodes[nodeId];
  }

  // Additional helper methods
  editProductDetail(): void {
  
  }

  filterBy(): void {
    // Implement filtering
  }

  runTestCase(): void {
    // Implement test case runner
  }
  getNodeKeys(): string[] {
    return Object.keys(this.treeNodes);
  }
}