"use client"

import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { ComponentNode, Page } from "@/lib/types"
import { pages } from "next/dist/build/templates/app-page"

interface DesignerState {
  pages: Page[]
  currentPageId: string
  componentTree: ComponentNode
  selectedComponentId: string | null
  clipboard: ComponentNode | null
  history: ComponentNode[]
  historyIndex: number
  customComponents: ComponentNode[]

  // Page actions
  addPage: (name: string) => void
  addPageInterface: (newPage: Page) => void
  renamePage: (id: string, name: string) => void
  deletePage: (id: string) => void
  setCurrentPage: (id: string) => void
  getCurrentPage: () => Page | undefined

  // Component actions
  addComponent: (type: string, properties: Record<string, any>, parentId: string | null) => void
  updateComponentProperty: (id: string, property: string, value: any) => void
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
    const { componentTree, history, historyIndex } = get()

    // Create a new history array that includes only the entries up to the current index
    // This removes any "future" history entries when making a new change after undoing
    const newHistory = history.slice(0, historyIndex + 1)

    // Add the current state to history
    newHistory.push(JSON.parse(JSON.stringify(componentTree)))

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false,
    })

    // Update the current page's component tree
    const { pages, currentPageId } = get()
    const updatedPages = pages.map((page) =>
      page.id === currentPageId ? { ...page, componentTree: JSON.parse(JSON.stringify(componentTree)) } : page,
    )
    set({ pages: updatedPages })
  },

  // Page management
  addPage: (name) => {
    const newPage: Page = {
      id: uuidv4(),
      name,
      componentTree: { ...initialComponentTree },
    }

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

  renamePage: (id, name) => {
    set((state) => ({
      pages: state.pages.map((page) => (page.id === id ? { ...page, name } : page)),
    }))
  },

  deletePage: (id) => {
    set((state) => {
      const newPages = state.pages.filter((page) => page.id !== id)

      // If we're deleting the current page, switch to another page
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

  // Find a component by ID in the tree
  findComponent: (tree: ComponentNode, id: string): ComponentNode | null => {
    if (tree.id === id) {
      return tree
    }

    for (const child of tree.children) {
      const found = get().findComponent(child, id)
      if (found) {
        return found
      }
    }

    return null
  },

  // Find a component's parent by ID
  findParent: (tree: ComponentNode, id: string): ComponentNode | null => {
    for (const child of tree.children) {
      if (child.id === id) {
        return tree
      }

      const found = get().findParent(child, id)
      if (found) {
        return found
      }
    }

    return null
  },

  // Clone a component tree
  cloneComponent: (component: ComponentNode): ComponentNode => {
    return {
      ...component,
      id: uuidv4(),
      children: component.children.map((child) => get().cloneComponent(child)),
    }
  },

  // Add a component to the tree
  addComponent: (type, properties, parentId) => {
    
    const defaultStyle = {
      fontSize: 16,
      borderRadius: 5,
      color: "#eb0000",
      backgroundColor: "#000000"
    }


    set((state) => {
      const newTree = JSON.parse(JSON.stringify(state.componentTree))
      const newComponent: ComponentNode = {
        id: uuidv4(),
        type,
        properties,
        children: [],
        style: defaultStyle,
        position: { x: 0, y: 0 },
      }

      // If no parent ID is provided, add to the root
      if (!parentId) {
        newTree.children.push(newComponent)
      } else {
        // Find the parent component
        const addToParent = (node: ComponentNode) => {
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

      // Save to history
      const newState = {
        componentTree: newTree,
        selectedComponentId: newComponent.id,
      }

      // Update history after state change
      setTimeout(() => get().saveToHistory(), 0)

      return newState
    })
  },

  // Update a component property
  updateComponentProperty: (id, property, value) => {
    set((state) => {
      const newTree = JSON.parse(JSON.stringify(state.componentTree))

      const updateProperty = (node: ComponentNode) => {
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

      // Save to history
      setTimeout(() => get().saveToHistory(), 0)

      return { componentTree: newTree }
    })
  },

  // Move a component
  moveComponent: (id, x, y) => {
    set((state) => {
      const newTree = JSON.parse(JSON.stringify(state.componentTree))

      const updatePosition = (node: ComponentNode) => {
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

      // Save to history
      setTimeout(() => get().saveToHistory(), 0)

      return { componentTree: newTree }
    })
  },

  // Delete a component
  deleteComponent: (id) => {
    set((state) => {
      const newTree = JSON.parse(JSON.stringify(state.componentTree))

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

      // Save to history
      setTimeout(() => get().saveToHistory(), 0)

      return {
        componentTree: newTree,
        selectedComponentId: null,
      }
    })
  },

  // Select a component
  selectComponent: (id) => {
    set({ selectedComponentId: id })
  },

  // Get the selected component
  getSelectedComponent: () => {
    const { componentTree, selectedComponentId } = get()
    if (!selectedComponentId) return null

    return get().findComponent(componentTree, selectedComponentId)
  },

  // Wrap a component with another component
  wrapComponent: (id, wrapperType) => {
    set((state) => {
      const newTree = JSON.parse(JSON.stringify(state.componentTree))
      const component = get().findComponent(newTree, id)
      const parent = get().findParent(newTree, id)

      if (!component || !parent) return state

      // Create the wrapper component
      const wrapper: ComponentNode = {
        id: uuidv4(),
        type: wrapperType,
        properties: {},
        children: [],
        style: {},
        position: { ...component.position },
      }

      // Replace the component with the wrapper in the parent's children
      const index = parent.children.findIndex((child) => child.id === id)
      if (index !== -1) {
        parent.children[index] = wrapper
        wrapper.children.push(component)
      }

      // Save to history
      setTimeout(() => get().saveToHistory(), 0)

      return {
        componentTree: newTree,
        selectedComponentId: wrapper.id,
      }
    })
  },

  // Copy a component to clipboard
  copyComponent: (id) => {
    const { componentTree } = get()
    const component = get().findComponent(componentTree, id)

    if (component) {
      set({ clipboard: JSON.parse(JSON.stringify(component)) })
    }
  },

  // Cut a component to clipboard
  cutComponent: (id) => {
    const { componentTree } = get()
    const component = get().findComponent(componentTree, id)

    if (component) {
      set({ clipboard: JSON.parse(JSON.stringify(component)) })
      get().deleteComponent(id)
    }
  },

  // Paste a component from clipboard
  pasteComponent: (targetId) => {
    const { clipboard } = get()

    if (!clipboard) return false

    // Clone the clipboard to create a new component with a new ID
    const clone = get().cloneComponent(clipboard)

    if (!targetId) {
      // Paste at root level
      set((state) => {
        const newTree = JSON.parse(JSON.stringify(state.componentTree))
        newTree.children.push(clone)

        // Save to history
        setTimeout(() => get().saveToHistory(), 0)

        return {
          componentTree: newTree,
          selectedComponentId: clone.id,
        }
      })
    } else {
      // Paste as child of target
      set((state) => {
        const newTree = JSON.parse(JSON.stringify(state.componentTree))
        const target = get().findComponent(newTree, targetId)

        if (target) {
          target.children.push(clone)

          // Save to history
          setTimeout(() => get().saveToHistory(), 0)

          return {
            componentTree: newTree,
            selectedComponentId: clone.id,
          }
        }

        return state
      })
    }

    return true
  },

  // Save a component as a custom component
  saveAsCustomComponent: (id) => {
    const { componentTree } = get()
    const component = get().findComponent(componentTree, id)

    if (component) {
      set((state) => ({
        customComponents: [...state.customComponents, JSON.parse(JSON.stringify(component))],
      }))
    }
  },

  // Undo the last action
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

  // Redo the last undone action
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

  // Set the component tree (used for loading saved designs)
  setComponentTree: (tree) => {
    set((state) => {
      const newState = {
        componentTree: tree,
        selectedComponentId: null,
      }

      // Update the current page's component tree
      const updatedPages = state.pages.map((page) =>
        page.id === state.currentPageId ? { ...page, componentTree: JSON.parse(JSON.stringify(tree)) } : page,
      )

      // Save to history
      setTimeout(() => get().saveToHistory(), 0)

      return {
        ...newState,
        pages: updatedPages,
      }
    })
  },
}))
