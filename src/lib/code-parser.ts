"use client";

import type { ComponentNode } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { COMPONENT_TYPES } from "@/lib/constants";

const defaultStyle = {
  fontSize: 16,
  borderRadius: 0,
  color: "#000000",
  backgroundColor: "#ffffff",
  width: 0,
  height: 0,
};

// Enhanced Flutter code parser
export async function parseFlutterCode(code: string): Promise<ComponentNode | null> {
  try {
    // Clean the code
    const cleanCode = code.trim();

    // Create a root node
    const root: ComponentNode = {
      id: "root",
      type: "root",
      properties: {},
      children: [],
      style: { ...defaultStyle },
      position: { x: 0, y: 0 },
    };

    // Parse the main widget structure
    const parsedChildren = parseWidgetStructure(cleanCode);
    root.children = parsedChildren;

    return root;
  } catch (error) {
    console.error("Error parsing Flutter code:", error);
    return null;
  }
}

function parseWidgetStructure(code: string): ComponentNode[] {
  const components: ComponentNode[] = [];

  // Remove comments and clean whitespace
  const cleanCode = code
    .replace(/\/\/.*$/gm, "") // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Find all top-level widgets
  const widgets = extractTopLevelWidgets(cleanCode);

  for (const widget of widgets) {
    const component = parseWidget(widget);
    if (component) {
      components.push(component);
    }
  }

  return components;
}

function extractTopLevelWidgets(code: string): string[] {
  const widgets: string[] = [];
  let depth = 0;
  let start = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const prevChar = i > 0 ? code[i - 1] : "";

    // Handle string literals
    if ((char === '"' || char === "'") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
    }

    if (!inString) {
      if (char === "(") {
        if (depth === 0) {
          // Find the widget name before this opening parenthesis
          let nameStart = i - 1;
          while (nameStart >= 0 && /[a-zA-Z_]/.test(code[nameStart])) {
            nameStart--;
          }
          start = nameStart + 1;
        }
        depth++;
      } else if (char === ")") {
        depth--;
        if (depth === 0) {
          // Extract the complete widget
          const widget = code.substring(start, i + 1).trim();
          if (widget && isValidWidget(widget)) {
            widgets.push(widget);
          }
        }
      }
    }
  }

  return widgets;
}

function isValidWidget(widget: string): boolean {
  const widgetTypes = [
    "Container",
    "Row",
    "Column",
    "Text",
    "ElevatedButton",
    "OutlinedButton",
    "TextButton",
    "TextField",
    "TextFormField",
    "Checkbox",
    "Switch",
    "Radio",
    "Card",
    "Stack",
    "ListView",
    "AppBar",
    "Slider",
    "DropdownButton",
    "DropdownButtonFormField",
    "Table",
    "Form",
    "Icon",
    "Padding",
    "Center",
    "Align",
    "Expanded",
    "Flexible",
    "SizedBox",
  ];

  return widgetTypes.some((type) => widget.startsWith(type + "("));
}

function parseWidget(widgetCode: string): ComponentNode | null {
  const trimmed = widgetCode.trim();

  // Extract widget type
  const typeMatch = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
  if (!typeMatch) return null;

  const widgetType = typeMatch[1];
  const component: ComponentNode = {
    id: uuidv4(),
    type: mapFlutterWidgetToComponentType(widgetType),
    properties: {},
    children: [],
    style: { ...defaultStyle },
    position: { x: 0, y: 0 },
  };

  // Parse properties and children
  const content = extractWidgetContent(trimmed);
  parseWidgetProperties(content, component);

  return component;
}

function mapFlutterWidgetToComponentType(flutterWidget: string): string {
  const mapping: Record<string, string> = {
    Container: COMPONENT_TYPES.CONTAINER,
    Text: COMPONENT_TYPES.TEXT,
    ElevatedButton: COMPONENT_TYPES.BUTTON,
    OutlinedButton: COMPONENT_TYPES.BUTTON,
    TextButton: COMPONENT_TYPES.BUTTON,
    TextField: COMPONENT_TYPES.TEXT_FIELD,
    Checkbox: COMPONENT_TYPES.CHECKBOX,
    Switch: COMPONENT_TYPES.SWITCH,
    Radio: COMPONENT_TYPES.RADIO,
    Card: COMPONENT_TYPES.CARD,
    Stack: COMPONENT_TYPES.STACK,
    ListView: COMPONENT_TYPES.LIST_VIEW,
    Slider: COMPONENT_TYPES.SLIDER,
    DropdownButton: COMPONENT_TYPES.DROPDOWN_BUTTON,
    Table: COMPONENT_TYPES.TABLE,
    Icon: COMPONENT_TYPES.ICON,
  };

  return mapping[flutterWidget] || COMPONENT_TYPES.CONTAINER;
}

function extractWidgetContent(widgetCode: string): string {
  const openParen = widgetCode.indexOf("(");
  if (openParen === -1) return "";

  let depth = 0;
  const start = openParen + 1;
  let end = widgetCode.length - 1;

  for (let i = openParen; i < widgetCode.length; i++) {
    if (widgetCode[i] === "(") depth++;
    else if (widgetCode[i] === ")") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  return widgetCode.substring(start, end).trim();
}

function parseWidgetProperties(content: string, component: ComponentNode) {
  // Parse different property patterns
  parseTextProperty(content, component);
  parsePaddingProperty(content, component);
  parseColorProperty(content, component);
  parseChildrenProperty(content, component);
  parseChildProperty(content, component);
  parseButtonProperties(content, component);
  parseTextFieldProperties(content, component);
  parseContainerProperties(content, component);
  parseSliderProperties(content, component);
  parseTableProperties(content, component);
  parseIconProperties(content, component);
}

function parseTextProperty(content: string, component: ComponentNode) {
  // Match Text widget content or text properties
  const textMatches = [
    /Text\s*\(\s*['"]([^'"]*)['"]/,
    /text:\s*['"]([^'"]*)['"]/,
    /title:\s*Text\s*\(\s*['"]([^'"]*)['"]/,
    /child:\s*Text\s*\(\s*['"]([^'"]*)['"]/,
  ];

  for (const regex of textMatches) {
    const match = content.match(regex);
    if (match) {
      component.properties.text = match[1];
      break;
    }
  }
}

function parsePaddingProperty(content: string, component: ComponentNode) {
  const paddingMatch = content.match(/padding:\s*EdgeInsets\.all\s*$$\s*(\d+(?:\.\d+)?)\s*$$/);
  if (paddingMatch) {
    component.properties.padding = Number.parseFloat(paddingMatch[1]);
  }
}

function parseColorProperty(content: string, component: ComponentNode) {
  const colorMatch = content.match(/color:\s*Color\s*$$\s*0xFF([A-Fa-f0-9]{6})\s*$$/);
  if (colorMatch) {
    component.properties.color = `#${colorMatch[1].toUpperCase()}`;
  }

  const backgroundColorMatch = content.match(/backgroundColor:\s*Color\s*$$\s*0xFF([A-Fa-f0-9]{6})\s*$$/);
  if (backgroundColorMatch) {
    if (!component.style) component.style = { ...defaultStyle };
    component.style.backgroundColor = `#${backgroundColorMatch[1].toUpperCase()}`;
  }
}

function parseChildrenProperty(content: string, component: ComponentNode) {
  const childrenMatch = content.match(/children:\s*\[([\s\S]*?)\](?:\s*,|\s*$)/);
  if (childrenMatch) {
    const childrenContent = childrenMatch[1];
    const childWidgets = extractChildWidgets(childrenContent);

    for (const childWidget of childWidgets) {
      const childComponent = parseWidget(childWidget);
      if (childComponent) {
        component.children.push(childComponent);
      }
    }
  }
}

function parseChildProperty(content: string, component: ComponentNode) {
  const childMatch = content.match(/child:\s*([A-Za-z_][A-Za-z0-9_]*\s*$$[\s\S]*?$$)(?:\s*,|\s*$)/);
  if (childMatch) {
    const childWidget = childMatch[1];
    const childComponent = parseWidget(childWidget);
    if (childComponent) {
      component.children.push(childComponent);
    }
  }
}

function parseButtonProperties(content: string, component: ComponentNode) {
  if (component.type === COMPONENT_TYPES.BUTTON) {
    // Determine button variant based on Flutter widget type
    if (content.includes("ElevatedButton")) {
      component.properties.variant = "primary";
    } else if (content.includes("OutlinedButton")) {
      component.properties.variant = "outline";
    } else if (content.includes("TextButton")) {
      component.properties.variant = "text";
    }
  }
}

function parseTextFieldProperties(content: string, component: ComponentNode) {
  if (component.type === COMPONENT_TYPES.TEXT_FIELD) {
    const labelMatch = content.match(/labelText:\s*['"]([^'"]*)['"]/);
    if (labelMatch) {
      component.properties.label = labelMatch[1];
    }

    const hintMatch = content.match(/hintText:\s*['"]([^'"]*)['"]/);
    if (hintMatch) {
      component.properties.hint = hintMatch[1];
      component.properties.placeholder = hintMatch[1];
    }
  }
}

function parseContainerProperties(content: string, component: ComponentNode) {
  if (component.type === COMPONENT_TYPES.CONTAINER) {
    // Parse decoration properties
    const decorationMatch = content.match(/decoration:\s*BoxDecoration\s*$$([\s\S]*?)$$/);
    if (decorationMatch) {
      const decorationContent = decorationMatch[1];

      const borderRadiusMatch = decorationContent.match(
        /borderRadius:\s*BorderRadius\.circular\s*$$\s*(\d+(?:\.\d+)?)\s*$$/
      );
      if (borderRadiusMatch) {
        if (!component.style) component.style = { ...defaultStyle };
        component.style.borderRadius = Number.parseFloat(borderRadiusMatch[1]);
      }
    }
  }
}

function parseSliderProperties(content: string, component: ComponentNode) {
  if (component.type === COMPONENT_TYPES.SLIDER) {
    const valueMatch = content.match(/value:\s*(\d+(?:\.\d+)?)/);
    if (valueMatch) {
      component.properties.value = Number.parseFloat(valueMatch[1]);
    }

    const minMatch = content.match(/min:\s*(\d+(?:\.\d+)?)/);
    if (minMatch) {
      component.properties.min = Number.parseFloat(minMatch[1]);
    }

    const maxMatch = content.match(/max:\s*(\d+(?:\.\d+)?)/);
    if (maxMatch) {
      component.properties.max = Number.parseFloat(maxMatch[1]);
    }
  }
}

function parseTableProperties(content: string, component: ComponentNode) {
  if (component.type === COMPONENT_TYPES.TABLE) {
    // Count table rows and columns from the structure
    const tableRowMatches = content.match(/TableRow\s*\(/g);
    if (tableRowMatches) {
      component.properties.rows = tableRowMatches.length - 1; // Subtract header row
    }

    // Try to extract column count from first row
    const firstRowMatch = content.match(/TableRow\s*\([^)]*children:\s*\[([\s\S]*?)\]/);
    if (firstRowMatch) {
      const cellMatches = firstRowMatch[1].match(/Padding\s*\(/g);
      if (cellMatches) {
        component.properties.columns = cellMatches.length;
      }
    }
  }
}

function parseIconProperties(content: string, component: ComponentNode) {
  if (component.type === COMPONENT_TYPES.ICON) {
    const iconMatch = content.match(/Icons\.(\w+)/);
    if (iconMatch) {
      component.properties.icon = iconMatch[1];
    }

    const sizeMatch = content.match(/size:\s*(\d+(?:\.\d+)?)/);
    if (sizeMatch) {
      component.properties.size = Number.parseFloat(sizeMatch[1]);
    }
  }
}

function extractChildWidgets(childrenContent: string): string[] {
  const widgets: string[] = [];
  let depth = 0;
  let start = 0;
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < childrenContent.length; i++) {
    const char = childrenContent[i];
    const prevChar = i > 0 ? childrenContent[i - 1] : "";

    // Handle string literals
    if ((char === '"' || char === "'") && prevChar !== "\\") {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
        stringChar = "";
      }
    }

    if (!inString) {
      if (char === "(") {
        if (depth === 0) {
          // Find widget name before this opening parenthesis
          let nameStart = i - 1;
          while (nameStart >= start && /[a-zA-Z_]/.test(childrenContent[nameStart])) {
            nameStart--;
          }
          start = nameStart + 1;
        }
        depth++;
      } else if (char === ")") {
        depth--;
        if (depth === 0) {
          // Extract the complete widget
          const widget = childrenContent.substring(start, i + 1).trim();
          if (widget && isValidWidget(widget)) {
            widgets.push(widget);
          }
          // Move start to next potential widget
          start = i + 1;
        }
      } else if (char === "," && depth === 0) {
        // Handle simple widgets that might not have parentheses
        const widget = childrenContent.substring(start, i).trim();
        if (widget && isValidWidget(widget)) {
          widgets.push(widget);
        }
        start = i + 1;
      }
    }
  }

  // Handle last widget if no trailing comma
  if (start < childrenContent.length) {
    const widget = childrenContent.substring(start).trim();
    if (widget && isValidWidget(widget)) {
      widgets.push(widget);
    }
  }

  return widgets;
}

function convertFlutterAlignment(flutterAlignment: string): string {
  const mapping: Record<string, string> = {
    start: "start",
    center: "center",
    end: "end",
    spaceBetween: "spaceBetween",
    spaceAround: "spaceAround",
    spaceEvenly: "spaceEvenly",
    stretch: "stretch",
    baseline: "baseline",
  };

  return mapping[flutterAlignment] || "start";
}
