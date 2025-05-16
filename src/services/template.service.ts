import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Connection, NodeType, TemplateInfo, TemplateNode } from '../app/models/template-node.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private nodesSubject = new BehaviorSubject<TemplateNode[]>([]);
  private connectionsSubject = new BehaviorSubject<Connection[]>([]);
  private selectedNodeSubject = new BehaviorSubject<TemplateNode | null>(null);
  private templateInfoSubject = new BehaviorSubject<TemplateInfo>({
    id: 'ABC-007',
    name: 'Health Insurance Template',
    version: 'Plan 1',
    status: 'draft',
    lastModified: new Date()
  });

  nodes$ = this.nodesSubject.asObservable();
  connections$ = this.connectionsSubject.asObservable();
  selectedNode$ = this.selectedNodeSubject.asObservable();
  templateInfo$ = this.templateInfoSubject.asObservable();

  constructor() {
    // Initialize with default template
    this.initializeDefaultTemplate();
  }

  private initializeDefaultTemplate() {
    const policyNode: TemplateNode = {
      id: 'policy-1',
      type: NodeType.POLICY,
      label: 'Policy Template',
      x: 50,
      y: 100
    };

    const planNode: TemplateNode = {
      id: 'plan-1',
      type: NodeType.PLAN,
      label: 'Plan',
      parentId: 'policy-1',
      x: 50,
      y: 200
    };

    const benefitNode: TemplateNode = {
      id: 'benefit-1',
      type: NodeType.BENEFIT_TYPE,
      label: 'Benefit Type',
      parentId: 'plan-1',
      properties: {
        inpatient: true
      },
      x: 50,
      y: 300
    };

    const unitPriceNode: TemplateNode = {
      id: 'unitprice-1',
      type: NodeType.UNIT_PRICE,
      label: 'Unit Price',
      parentId: 'benefit-1',
      properties: {
        amount: 1000,
        currency: 'INR'
      },
      x: 50,
      y: 400
    };

    const bonusNode: TemplateNode = {
      id: 'bonus-1',
      type: NodeType.BONUS,
      label: 'Bonus & Benefit',
      parentId: 'benefit-1',
      x: 200,
      y: 400
    };

    this.nodesSubject.next([
      policyNode,
      planNode,
      benefitNode,
      unitPriceNode,
      bonusNode
    ]);

    this.connectionsSubject.next([
      { source: 'policy-1', target: 'plan-1' },
      { source: 'plan-1', target: 'benefit-1' },
      { source: 'benefit-1', target: 'unitprice-1' },
      { source: 'benefit-1', target: 'bonus-1' }
    ]);
  }

  getNodes(): Observable<TemplateNode[]> {
    return this.nodes$;
  }

  getConnections(): Observable<Connection[]> {
    return this.connections$;
  }

  getSelectedNode(): Observable<TemplateNode | null> {
    return this.selectedNode$;
  }

  getTemplateInfo(): Observable<TemplateInfo> {
    return this.templateInfo$;
  }

  addNode(node: TemplateNode) {
    const currentNodes = this.nodesSubject.getValue();
    this.nodesSubject.next([...currentNodes, node]);
    
    if (node.parentId) {
      const currentConnections = this.connectionsSubject.getValue();
      this.connectionsSubject.next([
        ...currentConnections,
        { source: node.parentId, target: node.id }
      ]);
    }
  }

  updateNode(updatedNode: TemplateNode) {
    const currentNodes = this.nodesSubject.getValue();
    const updatedNodes = currentNodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    );
    this.nodesSubject.next(updatedNodes);
    
    if (this.selectedNodeSubject.getValue()?.id === updatedNode.id) {
      this.selectedNodeSubject.next(updatedNode);
    }
  }

  removeNode(nodeId: string) {
    const currentNodes = this.nodesSubject.getValue();
    const filteredNodes = currentNodes.filter(node => node.id !== nodeId);
    this.nodesSubject.next(filteredNodes);
    
    const currentConnections = this.connectionsSubject.getValue();
    const filteredConnections = currentConnections.filter(
      conn => conn.source !== nodeId && conn.target !== nodeId
    );
    this.connectionsSubject.next(filteredConnections);
    
    if (this.selectedNodeSubject.getValue()?.id === nodeId) {
      this.selectedNodeSubject.next(null);
    }
  }

  selectNode(node: TemplateNode | null) {
    this.selectedNodeSubject.next(node);
  }

  updateTemplateInfo(info: Partial<TemplateInfo>) {
    const currentInfo = this.templateInfoSubject.getValue();
    this.templateInfoSubject.next({
      ...currentInfo,
      ...info,
      lastModified: new Date()
    });
  }

  addConnection(connection: Connection) {
    const currentConnections = this.connectionsSubject.getValue();
    // Check if connection already exists
    const exists = currentConnections.some(
      conn => conn.source === connection.source && conn.target === connection.target
    );
    
    if (!exists) {
      this.connectionsSubject.next([...currentConnections, connection]);
    }
  }

  removeConnection(source: string, target: string) {
    const currentConnections = this.connectionsSubject.getValue();
    const filteredConnections = currentConnections.filter(
      conn => !(conn.source === source && conn.target === target)
    );
    this.connectionsSubject.next(filteredConnections);
  }

  saveTemplate() {
    // In a real app, this would save to a backend
    const template = {
      info: this.templateInfoSubject.getValue(),
      nodes: this.nodesSubject.getValue(),
      connections: this.connectionsSubject.getValue()
    };
    
    console.log('Saving template:', template);
    // Mock successful save
    this.updateTemplateInfo({
      status: 'active',
      lastModified: new Date()
    });
    
    return true;
  }
}