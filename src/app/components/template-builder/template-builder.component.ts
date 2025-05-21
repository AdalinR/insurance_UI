import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TemplateService } from '../../../services/template.service';

// Keep the existing interfaces
export interface PolicyNode {
  id: string;
  type: string;
  label: string;
  color: string;
  placeholder?: string;
  children: string[];
  position?: {
    x: number;
    y: number;
  };
  formData?: any;
}

export interface PolicyTemplate {
  id: string;
  name: string;
  templateName: string;
  templateId: string;
  templateVersion: string;
  templateStatus: string;
  treeNodes: { [key: string]: PolicyNode };
  rootNodeId: string | null;
}

export interface CoverTypeData {
  id: string;
  name: string;
  type: string;
  description: string;
  regulatoryCode: string;
  tooltip: string;
  subCoverYN: string;
  status: string;
  remarks: string;
}

export interface CoverDetailsData {
  id: string;
  coverTypeId: string;
  type: string;
  coverageLimit: number;
  calculationType: string;
  taxExcempted: string;
  excemptionReference: string;
  excemptionType: string;
  proRata: string;
  minimumPremium: number;
  baseRate: number;
  discountApplicableFor: string;
  sumInsured: number;
  dependentCover: string;
  dependantCoverName: string;
  effectiveDate: string;
  effectiveEndDate: string;
  excessPercent: number;
  excessAmount: number;
  excessDesc: string;
}

@Component({
  selector: 'app-template-builder',
  templateUrl: './template-builder.component.html',
  styleUrls: ['./template-builder.component.scss'],
  standalone: false
})
export class TemplateBuilderComponent implements OnInit, AfterViewInit, OnDestroy {
  // Component properties
  activeTab = 'elements';
  showFormModal = false;
  currentFormNode: PolicyNode | null = null;
  rootNodeId: string | null = null;
  selectedNode: string | null = null;
  treeNodes: { [key: string]: PolicyNode } = {};

  // Available nodes for dragging
  availableNodes: PolicyNode[] = [
    { id: 'Product', type: 'product', label: 'Product Details', color: '#00875a', children: [], placeholder: '---' },
    { id: 'Section', type: 'section', label: 'Section Details', color: '#0052cc', children: [], placeholder: '---' },
    { id: 'CoverType', type: 'coverType', label: 'Cover Type', color: '#00875a', children: [], placeholder: '---' },
    { id: 'Cover', type: 'cover', label: 'Cover Details', color: '#0052cc', children: [], placeholder: '---' },
    { id: 'Rating Fields', type: 'rating-fields', label: 'Rating Fields', color: '#00875a', children: [], placeholder: '---' },
    { id: 'Document', type: 'document', label: 'Document', color: '#0052cc', children: [], placeholder: '---' }
  ];

  // Available insurance components for dragging
  availableInsuranceNodes: PolicyNode[] = [
    { id: 'sum-insured-template', type: 'sumInsured', label: 'Sum Insured', color: '#e60000', children: [], placeholder: '---' },
    { id: 'coverage-limit-template', type: 'coverage-limit', label: 'Coverage Limit', color: '#e60000', children: [], placeholder: '---' },
    // { id: 'duration-limit-template', type: 'duration-limit', label: 'Duration Limit', color: '#e60000', children: [], placeholder: '---' },
    // { id: 'deductible-template', type: 'deductible', label: 'Deductible', color: '#e60000', children: [], placeholder: '---' },
    // { id: 'copayment-template', type: 'copayment', label: 'Co-payment', color: '#e60000', children: [], placeholder: '---' }
  ];

  productIcons: string[] = ['ion-android-boat', 'ion-android-bicycle', 'ion-android-car'];
  currencies: string[] = ['USD', 'INR', 'EUR'];
  productTypes: string[] = ['Motor', 'Fire', 'Life'];
  coverTypes: string[] = ['Base', 'Benefit', 'Discount', 'Loading', 'Optional', 'Promocode'];
  calculationType: string[] = ['Amount', 'Mile', 'Percentage', 'Factor'];
  excemptionType: string[] = ['policyHolder Excempted', 'Risk Excempted'];
  proRata: string[] = ['Days Based', 'No Prorata', 'Percentage Based'];
  discountApplicableList: string[] = ['On Building', 'Content Cover', 'Domestic Cover', 'Domestic Cover New', 'Base Cover', 'Cyber Cover'];
  template: PolicyTemplate | any = null;
  productName: string = '';

  // For saving templates
  savedTemplates: { [key: string]: PolicyTemplate } = {};
  coverageType: any | null;
  
  // For multi-selection and bulk actions
  selectedNodes: Set<string> = new Set();
  
  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private templateService: TemplateService
  ) { }

  ngOnInit(): void {
    // Subscribe to template service for reactive updates
    this.subscriptions.push(
      this.templateService.currentTemplate$.subscribe(template => {
        if (template) {
          this.template = template;
          this.treeNodes = template.treeNodes || {};
          this.rootNodeId = template.rootNodeId;
          this.productName = template.name || '';
          this.cdr.detectChanges();
        } else {
          this.initNewTemplate();
        }
      })
    );
    
    this.subscriptions.push(
      this.templateService.savedTemplates$.subscribe(templates => {
        this.savedTemplates = templates;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Initialize a new template
  initNewTemplate(): void {
    this.templateService.initNewTemplate();
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
      // position: {
      //   x: event.offsetX,
      //   y: event.offsetY
      // }
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

    // Auto-save to localStorage
    this.saveTemplateState();

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

      // Auto-save on node drag
      this.saveTemplateState();

      this.cdr.detectChanges();
    }
  }

  // Method to open the node form modal
  openNodeForm(nodeId: string): void {
    this.coverageType = JSON.parse(sessionStorage.getItem('coverType') || '{}');
    console.log('Coverage Type:', this.coverageType);
    console.log('Opening form for node:', nodeId, this.treeNodes[nodeId].formData);
  
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
      if (node.type === 'product') {
        node.formData = {
          name: '',
          description: '',
          regulatoryCode: '',
          icon: '',
          currency: '',
          productType: 'productName',
          effectiveDate: '',
          status: 'Pending',
          packagePolicy: 'No',
          remarks: ''
        };
      }
      else if (node.type === 'section') {
        node.formData = {
          name: '',
          regulatoryCode: '',
          productType: '',
          effectiveDate: '',
          status: 'Pending',
          remarks: ''
        };
      }
      else if (node.type === 'coverType') {
        node.formData = {
          name: '',
          type: '',
          description: '',
          regulatoryCode: '',
          tooltip: '',
          subCoverYN: '',
          status: 'Pending',
          remarks: ''
        };
      }
      else if (node.type === 'cover') {
        node.formData = {
          type: '',
          // coverageLimit: '',
          calculationType: '', 
          taxExcempted: 'No',
          excemptionReference:'',
          excemptionType: '',
          proRata: '',
          minimumPremium: '',
          baseRate: '',
          discountApplicableFor: '',
          // sumInsured: '',
          dependentCover: '',
          dependantCoverName: '',
          effectiveDate: '',
          effectiveEndDate: '',
          excessPercent: '',
          excessAmount: '',
          excessDesc: ''
        };
      }
      else if (node.type === 'rating-fields') {
        node.formData = {
          name: '',
          description: '',
          regulatoryCode: '',
          tooltip: '',
          subCoverYN: '',
          status: 'Pending',
          remarks: ''
        };
      }
      else if (node.type === 'document') {
        node.formData = {
          name: '',
          description: '',
          regulatoryCode: '',
          tooltip: '',
          subCoverYN: '',
          status: 'Pending',
          remarks: ''
        };
      }
      else if (node.type === 'coverage-limit') {
        node.formData = {
          coverageLimit: '',
        };
      }
      else if (node.type === 'sumInsured') {
        node.formData = {
          sumInsured: '',
        };
      }
    }
  }

  // Save node form data
  saveNodeForm(formData: any): void {
    // Update the formData in the node
    if (this.currentFormNode && this.selectedNode) {
      this.treeNodes[this.selectedNode].formData = { ...formData };

      // If it's a product node, update the template name
      if (this.treeNodes[this.selectedNode].type === 'product' && formData.name) {
        this.template.name = formData.name;
        this.productName = formData.name;
      }
      if (this.treeNodes[this.selectedNode].type === 'coverType') {
        sessionStorage.setItem('coverType', JSON.stringify(formData));
        this.coverageType = formData;
      }

      // Save template state
      this.saveTemplateState();
    }

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

    // Save state after removing node
    this.saveTemplateState();

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

  // Save the current template state
  saveTemplateState(): void {
    if (this.template) {
      this.templateService.updateTreeNodes(this.treeNodes, this.rootNodeId);
    }
  }

  // Save template and redirect to templates list
  saveTemplate(): void {
    this.templateService.saveCurrentTemplate();
    alert('Template saved successfully!');
  }

  // Helper methods for editing
  editProductDetail(): void {
    this.templateService.saveCurrentTemplate();
  }

  // Method to load a template for editing
  editTemplate(templateId: string): void {
    this.templateService.loadTemplateForEditing(templateId);
    window.location.reload(); // Reload the page to load the template
  }

  /**
   * Creates a new Cover Type node under a section
   * @param sectionId The ID of the parent section node
   * @returns The ID of the newly created cover type node
   */
  createCoverTypeNode(sectionId: string): string {
    // Generate a unique ID for the new cover type node
    const newNodeId = this.generateId();
    
    // Create the new cover type node
    const newNode: PolicyNode = {
      id: newNodeId,
      type: 'coverType',
      label: 'Cover Type',
      color: '#00875a',
      children: [],
      position: {
        x: this.treeNodes[sectionId].position?.x ? this.treeNodes[sectionId].position.x + 150 : 150,
        y: this.treeNodes[sectionId].position?.y ? this.treeNodes[sectionId].position.y + 100 : 100
      },
      formData: {
        name: '',
        type: '',
        description: '',
        regulatoryCode: '',
        tooltip: '',
        subCoverYN: 'No',
        status: 'Pending',
        remarks: ''
      }
    };
    
    // Add to tree nodes
    this.treeNodes[newNodeId] = newNode;
    
    // Add as a child to the section
    this.treeNodes[sectionId].children.push(newNodeId);
    
    // Save template state
    this.saveTemplateState();
    
    return newNodeId;
  }

  /**
   * Creates a new Cover Details node under a cover type
   * @param coverTypeId The ID of the parent cover type node
   * @returns The ID of the newly created cover details node
   */
  createCoverDetailsNode(coverTypeId: string): string {
    // Get the cover type data to use for the cover details
    const coverTypeData = this.treeNodes[coverTypeId]?.formData;
    const coverType = coverTypeData?.type || '';
    
    // Generate a unique ID for the new cover details node
    const newNodeId = this.generateId();
    
    // Create the new cover details node
    const newNode: PolicyNode = {
      id: newNodeId,
      type: 'cover',
      label: 'Cover Details',
      color: '#0052cc',
      children: [],
      position: {
        x: this.treeNodes[coverTypeId].position?.x ? this.treeNodes[coverTypeId].position.x + 150 : 150,
        y: this.treeNodes[coverTypeId].position?.y ? this.treeNodes[coverTypeId].position.y + 100 : 100
      },
      formData: {
        coverTypeId: coverTypeId,
        type: coverType,
        coverageLimit: 0,
        calculationType: '',
        taxExcempted: 'No',
        excemptionReference: '',
        excemptionType: '',
        proRata: '',
        minimumPremium: 0,
        baseRate: 0,
        discountApplicableFor: '',
        sumInsured: 0,
        dependentCover: 'No',
        dependantCoverName: '',
        effectiveDate: new Date().toISOString().substring(0, 10),
        effectiveEndDate: '',
        excessPercent: 0,
        excessAmount: 0,
        excessDesc: ''
      }
    };
    
    // Add to tree nodes
    this.treeNodes[newNodeId] = newNode;
    
    // Add as a child to the cover type
    this.treeNodes[coverTypeId].children.push(newNodeId);
    
    // Store cover type in session storage for reference
    sessionStorage.setItem('coverType', JSON.stringify(coverTypeData));
    this.coverageType = coverTypeData;
    
    // Save template state
    this.saveTemplateState();
    
    return newNodeId;
  }

  /**
   * Gets all cover types under a specific section
   * @param sectionId The ID of the section node
   * @returns Array of cover type nodes
   */
  getCoverTypeNodes(sectionId: string): PolicyNode[] {
    if (!this.treeNodes[sectionId]) return [];
    
    return this.treeNodes[sectionId].children
      .filter(nodeId => this.treeNodes[nodeId] && this.treeNodes[nodeId].type === 'coverType')
      .map(nodeId => this.treeNodes[nodeId]);
  }

  /**
   * Gets all cover details under a specific cover type
   * @param coverTypeId The ID of the cover type node
   * @returns Array of cover detail nodes
   */
  getCoverDetailNodes(coverTypeId: string): PolicyNode[] {
    if (!this.treeNodes[coverTypeId]) return [];
    
    return this.treeNodes[coverTypeId].children
      .filter(nodeId => this.treeNodes[nodeId] && this.treeNodes[nodeId].type === 'cover')
      .map(nodeId => this.treeNodes[nodeId]);
  }

  /**
   * Updates a cover details form based on its parent cover type
   * This should be called when opening the cover details form
   * @param coverDetailsId The ID of the cover details node
   */
  updateCoverDetailsForm(coverDetailsId: string): void {
    const coverDetailsNode = this.treeNodes[coverDetailsId];
    if (!coverDetailsNode) return;

    const coverTypeNode = this.treeNodes[coverDetailsNode.formData.coverTypeId];
    if (coverTypeNode) {
      coverDetailsNode.formData.type = coverTypeNode.formData.type;
    }
  }
   getNodeKeys(): string[] {
    return Object.keys(this.treeNodes);
  }

}