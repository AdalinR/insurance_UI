import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PolicyNode, PolicyTemplate } from '../app/components/template-builder/template-builder.component';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  // Storage keys
  private readonly TEMPLATES_STORAGE_KEY = 'policyTemplates';
  private readonly CURRENT_TEMPLATE_KEY = 'currentTemplate';
  private readonly EDIT_TEMPLATE_ID_KEY = 'editTemplateId';

  // BehaviorSubjects to enable reactive programming
  private currentTemplateSubject = new BehaviorSubject<PolicyTemplate | null>(null);
  private savedTemplatesSubject = new BehaviorSubject<{ [key: string]: PolicyTemplate }>({});

  constructor() {
    // Load saved templates on service initialization
    this.loadSavedTemplates();
    this.loadCurrentTemplate();
  }

  // Observable for current template
  get currentTemplate$(): Observable<PolicyTemplate | null> {
    return this.currentTemplateSubject.asObservable();
  }

  // Observable for saved templates
  get savedTemplates$(): Observable<{ [key: string]: PolicyTemplate }> {
    return this.savedTemplatesSubject.asObservable();
  }

  // Get current template value
  get currentTemplate(): PolicyTemplate | null {
    return this.currentTemplateSubject.value;
  }

  // Get saved templates value
  get savedTemplates(): { [key: string]: PolicyTemplate } {
    return this.savedTemplatesSubject.value;
  }

  /**
   * Load saved templates from localStorage
   */
  loadSavedTemplates(): void {
    try {
      const savedTemplatesStr = localStorage.getItem(this.TEMPLATES_STORAGE_KEY);
      if (savedTemplatesStr) {
        const savedTemplates = JSON.parse(savedTemplatesStr);
        this.savedTemplatesSubject.next(savedTemplates);
      }
    } catch (e) {
      console.error('Error loading saved templates:', e);
      this.savedTemplatesSubject.next({});
    }
  }

  /**
   * Load current template from localStorage
   */
  loadCurrentTemplate(): void {
    try {
      // First check if we're editing an existing template
      const editTemplateId = localStorage.getItem(this.EDIT_TEMPLATE_ID_KEY);
      
      if (editTemplateId) {
        const savedTemplates = this.savedTemplatesSubject.value;
        if (savedTemplates[editTemplateId]) {
          this.currentTemplateSubject.next({ ...savedTemplates[editTemplateId] });
          // Clear the edit flag after loading
          localStorage.removeItem(this.EDIT_TEMPLATE_ID_KEY);
          return;
        }
      }
      
      // Try to load from session storage
      const currentTemplateStr = sessionStorage.getItem(this.CURRENT_TEMPLATE_KEY);
      if (currentTemplateStr) {
        const currentTemplate = JSON.parse(currentTemplateStr);
        this.currentTemplateSubject.next(currentTemplate);
      }
    } catch (e) {
      console.error('Error loading current template:', e);
      this.currentTemplateSubject.next(null);
    }
  }

  /**
   * Initialize a new template
   */
  initNewTemplate(): PolicyTemplate {
    const templateId = 'template-' + Math.random().toString(36).substr(2, 9);
    const newTemplate = {
      id: templateId,
      name: 'New Template',
      templateName: 'Insurance Product',
      templateId: 'ABC-' + Math.floor(1000 + Math.random() * 9000),
      templateVersion: '1.0',
      templateStatus: 'draft',
      treeNodes: {},
      rootNodeId: null
    };
    
    this.setCurrentTemplate(newTemplate);
    return newTemplate;
  }

  /**
   * Set the current template
   */
  setCurrentTemplate(template: PolicyTemplate): void {
    this.currentTemplateSubject.next(template);
    sessionStorage.setItem(this.CURRENT_TEMPLATE_KEY, JSON.stringify(template));
  }

  /**
   * Save templates to localStorage
   */
  saveSavedTemplates(): void {
    localStorage.setItem(this.TEMPLATES_STORAGE_KEY, JSON.stringify(this.savedTemplatesSubject.value));
  }

  /**
   * Save current template
   */
  saveCurrentTemplate(): void {
    const currentTemplate = this.currentTemplateSubject.value;
    if (!currentTemplate) return;
    
    // Update in session storage
    sessionStorage.setItem(this.CURRENT_TEMPLATE_KEY, JSON.stringify(currentTemplate));
    
    // Update in saved templates
    const savedTemplates = { ...this.savedTemplatesSubject.value };
    savedTemplates[currentTemplate.id] = { ...currentTemplate };
    
    // Save to localStorage
    this.savedTemplatesSubject.next(savedTemplates);
    this.saveSavedTemplates();
  }

  /**
   * Load a template for editing
   */
  loadTemplateForEditing(templateId: string): void {
    localStorage.setItem(this.EDIT_TEMPLATE_ID_KEY, templateId);
  }

  /**
   * Update tree nodes in current template
   */
  updateTreeNodes(treeNodes: { [key: string]: PolicyNode }, rootNodeId: string | null): void {
    const currentTemplate = this.currentTemplateSubject.value;
    if (!currentTemplate) return;
    
    const updatedTemplate = {
      ...currentTemplate,
      treeNodes,
      rootNodeId
    };
    
    this.setCurrentTemplate(updatedTemplate);
  }

  /**
   * Clear all templates (for testing)
   */
  clearAllData(): void {
    localStorage.removeItem(this.TEMPLATES_STORAGE_KEY);
    sessionStorage.removeItem(this.CURRENT_TEMPLATE_KEY);
    localStorage.removeItem(this.EDIT_TEMPLATE_ID_KEY);
    this.savedTemplatesSubject.next({});
    this.currentTemplateSubject.next(null);
  }
}