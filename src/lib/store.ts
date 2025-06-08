"use client"

import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { ComponentNode, Page } from "@/lib/types"
import stompService from "./StompService"
import { ACTION_TYPES } from "./constants"

interface DesignerState {
  pages: Page[]
  currentPageId: string
  componentTree: ComponentNode
  selectedComponentId: string | null
  clipboard: ComponentNode | null
  history: ComponentNode[]
  historyIndex: number
  customComponents: ComponentNode[]

  // Remote actions (called from WebSocket)
  updateComponentRemote: (component: any) => void
  updateComponentPropertyRemote: (id: string, property: string, value: any) => void
  addComponentRemote: (newComponent: ComponentNode, pageId: string, parentId: string | null) => void
  deleteComponentRemote: (componentId: string, pageId: string) => void
  addPageRemote: (newPage: Page) => void
  deletePageRemote: (pageId: string) => void
  moveComponentRemote: (componentId: string, x: number, y: number, pageId: string) => void

  // Initialization
  initializePages: (pages: Page[], currentPageId?: string) => void

  // Page actions
  addPage: (name: string) => void
  addPageInterface: (newPage: Page) => void
  renamePage: (id: string, name: string) => void
  deletePage: (id: string) => void
  setCurrentPage: (id: string) => void
  getCurrentPage: () => Page | undefined

  // Component actions
  addComponent: (type: string, properties: Record<string, any>, parentId: string | null, style: Record<string, any>) => void
  updateComponentProperty: (id: string, property: string, value: any) => void
  updateComponent: (componentNode: ComponentNode) => void
  deleteComponent: (id: string) => void
  selectComponent: (id: string | null) => void
  getSelectedComponent: () => ComponentNode | null
  wrapComponent: (id: string, wrapperType: string) => void
  copyComponent: (id: string) => void
  cutComponent: (id: string) => void
  pasteComponent: (targetId: string | null) => boolean
  saveAsCustomComponent: (id: string) => void
  moveComponent: (id: string, x: number, y: number) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  setComponentTree: (tree: ComponentNode) => void
}

// === UTILITY FUNCTIONS (Separated Logic) ===

const cloneComponent = (component: ComponentNode): ComponentNode => {
  return {
    ...component,
    id: uuidv4(),
    children: component.children.map((child) => cloneComponent(child)),
  }
}

const findComponent = (tree: ComponentNode, id: string): ComponentNode | null => {
  if (tree.id === id) {
    return tree
  }

  for (const child of tree.children) {
    const found = findComponent(child, id)
    if (found) {
      return found
    }
  }

  return null
}

const findParent = (tree: ComponentNode, id: string): ComponentNode | null => {
  for (const child of tree.children) {
    if (child.id === id) {
      return tree
    }

    const found = findParent(child, id)
    if (found) {
      return found
    }
  }

  return null
}

const addComponentToTree = (tree: ComponentNode, newComponent: ComponentNode, parentId: string | null): ComponentNode => {
  const newTree = JSON.parse(JSON.stringify(tree))

  if (!parentId) {
    // Add to root level
    newTree.children.push(newComponent)
  } else {
    // Find parent and add to it
    const addToParent = (node: ComponentNode): boolean => {
      if (node.id === parentId) {
        node.children.push(newComponent)
        return true
      }

      for (const child of node.children) {
        if (addToParent(child)) {
          return true
        }
      }

      return false
    }

    addToParent(newTree)
  }

  return newTree
}

const updateComponentInTree = (tree: ComponentNode, componentNode: ComponentNode): ComponentNode => {
  const newTree = JSON.parse(JSON.stringify(tree))

  const updateNode = (node: ComponentNode): boolean => {
    if (node.id === componentNode.id) {
      Object.assign(node, componentNode)
      return true
    }

    for (const child of node.children) {
      if (updateNode(child)) {
        return true
      }
    }

    return false
  }

  updateNode(newTree)
  return newTree
}

const deleteComponentFromTree = (tree: ComponentNode, id: string): ComponentNode => {
  const newTree = JSON.parse(JSON.stringify(tree))

  const deleteFromParent = (node: ComponentNode) => {
    node.children = node.children.filter((child) => {
      if (child.id === id) {
        return false
      }

      deleteFromParent(child)
      return true
    })
  }

  deleteFromParent(newTree)
  return newTree
}

const updateComponentPropertyInTree = (tree: ComponentNode, id: string, property: string, value: any): ComponentNode => {
  const newTree = JSON.parse(JSON.stringify(tree))
  const updateProperty = (node: ComponentNode): boolean => {
    if (node.id === id) {
      // Handle nested properties like "style.width"
      if (property.includes(".")) {
        const [obj, prop] = property.split(".")
        if (!node[obj]) {
          node[obj] = {}
        }
        node[obj][prop] = value
      } else {
        node.properties[property] = value
      }
      return true
    }

    for (const child of node.children) {
      if (updateProperty(child)) {
        return true
      }
    }

    return false
  }

  updateProperty(newTree)
  return newTree
}

const updateComponentPositionInTree = (tree: ComponentNode, id: string, x: number, y: number): ComponentNode => {
  const newTree = JSON.parse(JSON.stringify(tree))

  const updatePosition = (node: ComponentNode): boolean => {
    if (node.id === id) {
      node.position = { x, y }
      return true
    }

    for (const child of node.children) {
      if (updatePosition(child)) {
        return true
      }
    }

    return false
  }

  updatePosition(newTree)
  return newTree
}

const generateUniqueName = (baseName: string, existingNames: string[]): string => {
  if (!existingNames.includes(baseName)) return baseName

  let suffix = 1
  let newName = `${baseName}${suffix}`
  while (existingNames.includes(newName)) {
    suffix++
    newName = `${baseName}${suffix}`
  }
  return newName
}

const getInitialState = (pages?: Page[]) => {
  if (pages && pages.length > 0) {
    const firstPage = pages[0]
    return {
      pages,
      currentPageId: firstPage.id,
      componentTree: JSON.parse(JSON.stringify(firstPage.componentTree)),
      history: [JSON.parse(JSON.stringify(firstPage.componentTree))],
    }
  }

  // Default state if no pages provided
  const defaultPage: Page = {
    id: uuidv4(),
    name: "Home",
    componentTree: { ...initialComponentTree },
  }

  return {
    pages: [defaultPage],
    currentPageId: defaultPage.id,
    componentTree: { ...initialComponentTree },
    history: [{ ...initialComponentTree }],
  }
}

// === INITIAL STATE ===

const initialComponentTree: ComponentNode = {
  id: "root",
  type: "root",
  properties: {},
  children: [],
  style: {},
  position: { x: 0, y: 0 },
}

const initialPage: Page = {
  id: uuidv4(),
  name: "Home",
  componentTree: { ...initialComponentTree },
}

// === ZUSTAND STORE ===

export const useDesignerStore = create<DesignerState>((set, get) => ({
  pages: [initialPage],
  currentPageId: initialPage.id,
  componentTree: { ...initialComponentTree },
  selectedComponentId: null,
  clipboard: null,
  history: [{ ...initialComponentTree }],
  historyIndex: 0,
  customComponents: [],
  canUndo: false,
  canRedo: false,

  // Helper function to save state to history
  saveToHistory: () => {
    const { componentTree, history, historyIndex, pages, currentPageId } = get()

    // Create a new history array that includes only the entries up to the current index
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(componentTree)))

    // Update the current page's component tree
    const updatedPages = pages.map((page) =>
      page.id === currentPageId ? { ...page, componentTree: JSON.parse(JSON.stringify(componentTree)) } : page,
    )

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
      pages: updatedPages,
    })
  },

  initializePages: (pages: Page[], currentPageId?: string) => {
    // Validate that pages array is not empty
    if (!pages || pages.length === 0) {
      console.warn('Cannot initialize with empty pages array')
      return
    }

    // Determine which page should be current
    let targetPageId = currentPageId
    if (!targetPageId || !pages.find(p => p.id === targetPageId)) {
      targetPageId = pages[0].id
    }

    const currentPage = pages.find(p => p.id === targetPageId)!

    set({
      pages: JSON.parse(JSON.stringify(pages)), // Deep clone to avoid mutations
      currentPageId: targetPageId,
      componentTree: JSON.parse(JSON.stringify(currentPage.componentTree)),
      selectedComponentId: null,
      clipboard: null,
      history: [JSON.parse(JSON.stringify(currentPage.componentTree))],
      historyIndex: 0,
      customComponents: [],
      canUndo: false,
      canRedo: false,
    })
  },

  // === REMOTE ACTIONS ===

  addComponentRemote: (newComponent: ComponentNode, pageId: string, parentId: string | null) => {
    set((state) => {
      // Find the target page
      const targetPageIndex = state.pages.findIndex(page => page.id === pageId)
      if (targetPageIndex === -1) {
        console.warn(`Page with id ${pageId} not found`)
        return state
      }

      const targetPage = state.pages[targetPageIndex]

      // Add component to the page's component tree
      const updatedComponentTree = addComponentToTree(targetPage.componentTree, newComponent, parentId)

      // Update the pages array
      const updatedPages = [...state.pages]
      updatedPages[targetPageIndex] = {
        ...targetPage,
        componentTree: updatedComponentTree
      }

      // If this is the current page, update the current component tree as well
      const newState: Partial<typeof state> = {
        pages: updatedPages
      }

      if (pageId === state.currentPageId) {
        newState.componentTree = updatedComponentTree
        newState.selectedComponentId = newComponent.id
      }

      return newState
    })

    // Save to history if it's the current page
    const { currentPageId } = get()
    if (pageId === currentPageId) {
      setTimeout(() => get().saveToHistory(), 0)
    }
  },

  deleteComponentRemote: (componentId: string, pageId: string) => {
    set((state) => {
      // Find the target page
      const targetPageIndex = state.pages.findIndex(page => page.id === pageId)
      if (targetPageIndex === -1) {
        console.warn(`Page with id ${pageId} not found`)
        return state
      }

      const targetPage = state.pages[targetPageIndex]

      // Delete component from the page's component tree
      const updatedComponentTree = deleteComponentFromTree(targetPage.componentTree, componentId)

      // Update the pages array
      const updatedPages = [...state.pages]
      updatedPages[targetPageIndex] = {
        ...targetPage,
        componentTree: updatedComponentTree
      }

      // If this is the current page, update the current component tree as well
      const newState: Partial<typeof state> = {
        pages: updatedPages
      }

      if (pageId === state.currentPageId) {
        newState.componentTree = updatedComponentTree
        // Clear selection if the deleted component was selected
        if (state.selectedComponentId === componentId) {
          newState.selectedComponentId = null
        }
      }

      return newState
    })

    // Save to history if it's the current page
    const { currentPageId } = get()
    if (pageId === currentPageId) {
      setTimeout(() => get().saveToHistory(), 0)
    }
  },

  addPageRemote: (newPage: Page) => {
    set((state) => {
      const existingNames = state.pages.map((page) => page.name)
      const uniqueName = generateUniqueName(newPage.name, existingNames)

      const finalPage = {
        ...newPage,
        name: uniqueName,
      }

      return {
        pages: [...state.pages, finalPage],
      }
    })
  },

  deletePageRemote: (pageId: string) => {
    set((state) => {
      const newPages = state.pages.filter((page) => page.id !== pageId)

      // If we're deleting the current page, switch to another page
      if (pageId === state.currentPageId && newPages.length > 0) {
        const newCurrentPage = newPages[0]
        return {
          pages: newPages,
          currentPageId: newCurrentPage.id,
          componentTree: JSON.parse(JSON.stringify(newCurrentPage.componentTree)),
          selectedComponentId: null,
          history: [JSON.parse(JSON.stringify(newCurrentPage.componentTree))],
          historyIndex: 0,
          canUndo: false,
          canRedo: false,
        }
      }

      return {
        pages: newPages,
      }
    })
  },

  moveComponentRemote: (componentId: string, x: number, y: number, pageId: string) => {
    set((state) => {
      // Find the target page
      const targetPageIndex = state.pages.findIndex(page => page.id === pageId)
      if (targetPageIndex === -1) {
        console.warn(`Page with id ${pageId} not found`)
        return state
      }

      const targetPage = state.pages[targetPageIndex]

      // Update component position in the page's component tree
      const updatedComponentTree = updateComponentPositionInTree(targetPage.componentTree, componentId, x, y)

      // Update the pages array
      const updatedPages = [...state.pages]
      updatedPages[targetPageIndex] = {
        ...targetPage,
        componentTree: updatedComponentTree
      }

      // If this is the current page, update the current component tree as well
      const newState: Partial<typeof state> = {
        pages: updatedPages
      }

      if (pageId === state.currentPageId) {
        newState.componentTree = updatedComponentTree
      }

      return newState
    })

    // Save to history if it's the current page
    const { currentPageId } = get()
    if (pageId === currentPageId) {
      setTimeout(() => get().saveToHistory(), 0)
    }
  },

  updateComponentRemote: (componentNode: ComponentNode) => {

    set((state) => {
      const newTree = updateComponentInTree(state.componentTree, componentNode)
      return { componentTree: newTree }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  
  
  updateComponentPropertyRemote: (id: string, property: string, value: any) => {
    set((state) => {
      const newTree = updateComponentPropertyInTree(state.componentTree, id, property, value)
      return { componentTree: newTree }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  // === PAGE MANAGEMENT ===

  addPage: (name) => {
    const newPage: Page = {
      id: uuidv4(),
      name,
      componentTree: { ...initialComponentTree },
    }

    // Send to WebSocket
    stompService.send({
      type: ACTION_TYPES.ADD_PAGE,
      payload: newPage,
    })

    set((state) => ({
      pages: [...state.pages, newPage],
      currentPageId: newPage.id,
      componentTree: { ...initialComponentTree },
      selectedComponentId: null,
      history: [{ ...initialComponentTree }],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
    }))
  },

  addPageInterface: (newPage) => {
    set((state) => {
      const existingNames = state.pages.map((page) => page.name)
      const uniqueName = generateUniqueName(newPage.name, existingNames)

      const finalPage = {
        ...newPage,
        name: uniqueName,
      }

      return {
        pages: [...state.pages, finalPage],
        currentPageId: finalPage.id,
        componentTree: { ...initialComponentTree },
        selectedComponentId: null,
        history: [{ ...initialComponentTree }],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      }
    })
  },

  renamePage: (id, name) => {
    set((state) => ({
      pages: state.pages.map((page) => (page.id === id ? { ...page, name } : page)),
    }))
  },

  deletePage: (id) => {
    // Send to WebSocket
    stompService.send({
      type: ACTION_TYPES.DELETE_PAGE,
      payload: { pageId: id },
    })

    set((state) => {
      const newPages = state.pages.filter((page) => page.id !== id)

      let newCurrentPageId = state.currentPageId
      let newComponentTree = state.componentTree

      if (id === state.currentPageId && newPages.length > 0) {
        newCurrentPageId = newPages[0].id
        newComponentTree = newPages[0].componentTree
      }

      return {
        pages: newPages,
        currentPageId: newCurrentPageId,
        componentTree: newComponentTree,
        selectedComponentId: null,
        history: [JSON.parse(JSON.stringify(newComponentTree))],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      }
    })
  },

  setCurrentPage: (id) => {
    set((state) => {
      const page = state.pages.find((p) => p.id === id)
      if (!page) return state

      return {
        currentPageId: id,
        componentTree: JSON.parse(JSON.stringify(page.componentTree)),
        selectedComponentId: null,
        history: [JSON.parse(JSON.stringify(page.componentTree))],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      }
    })
  },

  getCurrentPage: () => {
    const { pages, currentPageId } = get()
    return pages.find((page) => page.id === currentPageId)
  },

  // === COMPONENT ACTIONS (LOCAL) ===

  addComponent: (type, properties, parentId, style) => {
    const newComponent: ComponentNode = {
      id: uuidv4(),
      type,
      properties,
      children: [],
      style: style,
      position: { x: 0, y: 0 },
    }

    // Send to WebSocket
    stompService.send({
      type: ACTION_TYPES.ADD_COMPONENT,
      payload: {
        newComponent,
        pageId: get().currentPageId,
        parentId
      },
    })

    // Apply locally
    set((state) => {
      const newTree = addComponentToTree(state.componentTree, newComponent, parentId)

      return {
        componentTree: newTree,
        selectedComponentId: newComponent.id,
      }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  updateComponentProperty: (id, property, value) => {
    stompService.send({
      type: ACTION_TYPES.UPDATE_COMPONENT_PROPERTY,
      payload: { id, property, value }
    })

    set((state) => {
      const newTree = updateComponentPropertyInTree(state.componentTree, id, property, value)
      return { componentTree: newTree }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  updateComponent: (componentNode) => {
    stompService.send({
      type: ACTION_TYPES.UPDATE_COMPONENT,
      payload: componentNode,
    })

    set((state) => {
      const newTree = updateComponentInTree(state.componentTree, componentNode)
      return { componentTree: newTree }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  moveComponent: (id, x, y) => {
    // Send to WebSocket
    stompService.send({
      type: ACTION_TYPES.MOVE_COMPONENT,
      payload: {
        componentId: id,
        x,
        y,
        pageId: get().currentPageId,
      },
    })

    set((state) => {
      const newTree = updateComponentPositionInTree(state.componentTree, id, x, y)
      return { componentTree: newTree }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  deleteComponent: (id) => {
    // Send to WebSocket
    stompService.send({
      type: ACTION_TYPES.DELETE_COMPONENT,
      payload: {
        componentId: id,
        pageId: get().currentPageId,
      },
    })

    set((state) => {
      const newTree = deleteComponentFromTree(state.componentTree, id)

      return {
        componentTree: newTree,
        selectedComponentId: null,
      }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  selectComponent: (id) => {
    set({ selectedComponentId: id })
  },

  getSelectedComponent: () => {
    const { componentTree, selectedComponentId } = get()
    if (!selectedComponentId) return null

    return findComponent(componentTree, selectedComponentId)
  },

  wrapComponent: (id, wrapperType) => {
    set((state) => {
      const newTree = JSON.parse(JSON.stringify(state.componentTree))
      const component = findComponent(newTree, id)
      const parent = findParent(newTree, id)

      if (!component || !parent) return state

      const wrapper: ComponentNode = {
        id: uuidv4(),
        type: wrapperType,
        properties: {},
        children: [],
        style: {},
        position: { ...component.position },
      }

      const index = parent.children.findIndex((child) => child.id === id)
      if (index !== -1) {
        parent.children[index] = wrapper
        wrapper.children.push(component)
      }

      return {
        componentTree: newTree,
        selectedComponentId: wrapper.id,
      }
    })

    setTimeout(() => get().saveToHistory(), 0)
  },

  copyComponent: (id) => {
    const { componentTree } = get()
    const component = findComponent(componentTree, id)

    if (component) {
      set({ clipboard: JSON.parse(JSON.stringify(component)) })
    }
  },

  cutComponent: (id) => {
    const { componentTree } = get()
    const component = findComponent(componentTree, id)

    if (component) {
      set({ clipboard: JSON.parse(JSON.stringify(component)) })
      get().deleteComponent(id)
    }
  },

  pasteComponent: (targetId) => {
    const { clipboard } = get()

    if (!clipboard) return false

    const clone = cloneComponent(clipboard)

    if (!targetId) {
      set((state) => {
        const newTree = addComponentToTree(state.componentTree, clone, null)

        return {
          componentTree: newTree,
          selectedComponentId: clone.id,
        }
      })
    } else {
      set((state) => {
        const target = findComponent(state.componentTree, targetId)

        if (target) {
          const newTree = addComponentToTree(state.componentTree, clone, targetId)

          return {
            componentTree: newTree,
            selectedComponentId: clone.id,
          }
        }

        return state
      })
    }

    setTimeout(() => get().saveToHistory(), 0)
    return true
  },

  saveAsCustomComponent: (id) => {
    const { componentTree } = get()
    const component = findComponent(componentTree, id)

    if (component) {
      set((state) => ({
        customComponents: [...state.customComponents, JSON.parse(JSON.stringify(component))],
      }))
    }
  },

  undo: () => {
    set((state) => {
      const { history, historyIndex } = state

      if (historyIndex <= 0) return state

      const newIndex = historyIndex - 1
      const previousState = history[newIndex]

      return {
        componentTree: JSON.parse(JSON.stringify(previousState)),
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
      }
    })
  },

  redo: () => {
    set((state) => {
      const { history, historyIndex } = state

      if (historyIndex >= history.length - 1) return state

      const newIndex = historyIndex + 1
      const nextState = history[newIndex]

      return {
        componentTree: JSON.parse(JSON.stringify(nextState)),
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1,
      }
    })
  },

  setComponentTree: (tree) => {
    set((state) => {
      const updatedPages = state.pages.map((page) =>
        page.id === state.currentPageId ? { ...page, componentTree: JSON.parse(JSON.stringify(tree)) } : page,
      )

      setTimeout(() => get().saveToHistory(), 0)

      return {
        componentTree: tree,
        selectedComponentId: null,
        pages: updatedPages,
      }
    })
  },
}))