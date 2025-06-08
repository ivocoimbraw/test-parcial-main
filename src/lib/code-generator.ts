"use client";

import type { ComponentNode, Page } from "@/lib/types";
import { COMPONENT_TYPES } from "@/lib/constants";

// Función para detectar si una página necesita estado
function pageNeedsState(componentTree: ComponentNode): boolean {
  const checkComponentForState = (component: ComponentNode): boolean => {
    // Componentes que necesitan estado
    const statefulComponents = [
      COMPONENT_TYPES.CHECKBOX,
      COMPONENT_TYPES.SWITCH,
      COMPONENT_TYPES.SLIDER,
      COMPONENT_TYPES.TEXT_FIELD,
      COMPONENT_TYPES.RADIO,
      COMPONENT_TYPES.DROPDOWN_BUTTON,
    ];

    if (statefulComponents.includes(component.type)) {
      return true;
    }

    // Revisar recursivamente los hijos
    return component.children.some((child) => checkComponentForState(child));
  };

  return componentTree.children.some((child) => checkComponentForState(child));
}

// Función para generar variables de estado
function generateStateVariables(componentTree: ComponentNode, indent = 0): string {
  const spaces = " ".repeat(indent);
  let stateVars: string[] = [];

  const collectStateVariables = (component: ComponentNode) => {
    switch (component.type) {
      case COMPONENT_TYPES.CHECKBOX:
        const checkboxId = component.id.replace(/[^a-zA-Z0-9]/g, "");
        stateVars.push(`${spaces}bool _checkbox${checkboxId} = ${component.properties.value ? "true" : "false"};`);
        break;
      case COMPONENT_TYPES.SWITCH:
        const switchId = component.id.replace(/[^a-zA-Z0-9]/g, "");
        stateVars.push(`${spaces}bool _switch${switchId} = ${component.properties.value ? "true" : "false"};`);
        break;
      case COMPONENT_TYPES.SLIDER:
        const sliderId = component.id.replace(/[^a-zA-Z0-9]/g, "");
        const sliderValue = component.properties.value || 50;
        stateVars.push(`${spaces}double _slider${sliderId} = ${sliderValue}.0;`);
        break;
      case COMPONENT_TYPES.TEXT_FIELD:
        const textFieldId = component.id.replace(/[^a-zA-Z0-9]/g, "");
        stateVars.push(`${spaces}final TextEditingController _textController${textFieldId} = TextEditingController();`);
        break;
      case COMPONENT_TYPES.DROPDOWN_BUTTON:
        const dropdownId = component.id.replace(/[^a-zA-Z0-9]/g, "");
        const options = component.properties.options || ["Option 1", "Option 2", "Option 3"];
        stateVars.push(`${spaces}String? _dropdown${dropdownId} = '${options[0]}';`);
        break;
      case COMPONENT_TYPES.RADIO:
        const radioId = component.id.replace(/[^a-zA-Z0-9]/g, "");
        stateVars.push(`${spaces}String? _radio${radioId} = '${component.properties.groupValue || "option"}';`);
        break;
    }

    // Procesar hijos recursivamente
    component.children.forEach((child) => collectStateVariables(child));
  };

  componentTree.children.forEach((child) => collectStateVariables(child));

  return stateVars.join("\n");
}

// Función para generar dispose method
function generateDisposeMethod(componentTree: ComponentNode, indent = 0): string {
  const spaces = " ".repeat(indent);
  let disposeItems: string[] = [];

  const collectDisposeItems = (component: ComponentNode) => {
    if (component.type === COMPONENT_TYPES.TEXT_FIELD) {
      const textFieldId = component.id.replace(/[^a-zA-Z0-9]/g, "");
      disposeItems.push(`${spaces}    _textController${textFieldId}.dispose();`);
    }
    component.children.forEach((child) => collectDisposeItems(child));
  };

  componentTree.children.forEach((child) => collectDisposeItems(child));

  if (disposeItems.length > 0) {
    return `${spaces}@override
${spaces}void dispose() {
${disposeItems.join("\n")}
${spaces}    super.dispose();
${spaces}}\n`;
  }

  return "";
}

export function generateFlutterCodeTest(component: ComponentNode, indent = 0): string {
  const spaces = " ".repeat(indent);
  let widgetCode = "";

  switch (component.type) {
    case COMPONENT_TYPES.SLIDER:
      const sliderValue = component.properties.value || 50;
      const sliderMin = component.properties.min || 0;
      const sliderMax = component.properties.max || 100;
      const sliderId = component.id.replace(/[^a-zA-Z0-9]/g, "");

      widgetCode = `${spaces}Column(
${spaces}  children: [
${spaces}    Slider(
${spaces}      value: _slider${sliderId},
${spaces}      min: ${sliderMin}.0,
${spaces}      max: ${sliderMax}.0,
${spaces}      onChanged: (value) {
${spaces}        setState(() {
${spaces}          _slider${sliderId} = value;
${spaces}        });
${spaces}      },
${spaces}    ),
${spaces}    Text('Value: \${_slider${sliderId}.round()}'),
${spaces}  ],
${spaces})`;
      break;

    case COMPONENT_TYPES.DROPDOWN_BUTTON:
      const dropdownOptions = component.properties.options || ["Option 1", "Option 2", "Option 3"];
      const dropdownId = component.id.replace(/[^a-zA-Z0-9]/g, "");
      widgetCode = `${spaces}DropdownButton<String>(
${spaces}  value: _dropdown${dropdownId},
${spaces}  items: [
${dropdownOptions
  .map(
    (option: string) =>
      `${spaces}    DropdownMenuItem(\n${spaces}      value: '${option.replace(
        /'/g,
        "\\'"
      )}',\n${spaces}      child: Text('${option.replace(/'/g, "\\'")}'),\n${spaces}    )`
  )
  .join(",\n")}
${spaces}  ],
${spaces}  onChanged: (value) {
${spaces}    setState(() {
${spaces}      _dropdown${dropdownId} = value;
${spaces}    });
${spaces}  },
${spaces})`;
      break;

    case COMPONENT_TYPES.TABLE:
      const rows = component.properties.rows || 3;
      const columns = component.properties.columns || 3;
      const headers = component.properties.headers || Array.from({ length: columns }, (_, i) => `Column ${i + 1}`);

      widgetCode = `${spaces}Table(
${spaces}  border: TableBorder.all(),
${spaces}  children: [
${spaces}    TableRow(
${spaces}      decoration: BoxDecoration(color: Colors.grey[200]),
${spaces}      children: [
${headers
  .map(
    (header: string) =>
      `${spaces}        Padding(\n${spaces}          padding: EdgeInsets.all(8.0),\n${spaces}          child: Text(\n${spaces}            '${header.replace(
        /'/g,
        "\\'"
      )}',\n${spaces}            style: TextStyle(fontWeight: FontWeight.bold),\n${spaces}          ),\n${spaces}        )`
  )
  .join(",\n")}
${spaces}      ],
${spaces}    ),
${Array.from({ length: rows })
  .map(
    (_, rowIndex) =>
      `${spaces}    TableRow(\n${spaces}      children: [\n${Array.from({ length: columns })
        .map(
          (_, colIndex) =>
            `${spaces}        Padding(\n${spaces}          padding: EdgeInsets.all(8.0),\n${spaces}          child: Text('Row ${
              rowIndex + 1
            }, Col ${colIndex + 1}'),\n${spaces}        )`
        )
        .join(",\n")}\n${spaces}      ],\n${spaces}    )`
  )
  .join(",\n")}
${spaces}  ],
${spaces})`;
      break;

    case COMPONENT_TYPES.TEXT:
      widgetCode = `${spaces}Text(
${spaces}  '${(component.properties.text || "Text").replace(/'/g, "\\'")}',
${spaces}  style: TextStyle(
${spaces}    fontSize: ${component.style?.fontSize || 16},
${component.style?.color ? `${spaces}    color: Color(0xFF${component.style.color.substring(1)}),\n` : ""}${spaces}  ),
${spaces})`;
      break;

    case COMPONENT_TYPES.BUTTON:
      const buttonVariant = component.properties.variant || "primary";
      let buttonWidget = "";
      switch (buttonVariant) {
        case "primary":
          buttonWidget = `${spaces}ElevatedButton(
${spaces}  onPressed: () {
${spaces}    // Acción del botón
${spaces}  },
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`;
          break;
        case "outline":
          buttonWidget = `${spaces}OutlinedButton(
${spaces}  onPressed: () {
${spaces}    // Acción del botón
${spaces}  },
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`;
          break;
        case "text":
          buttonWidget = `${spaces}TextButton(
${spaces}  onPressed: () {
${spaces}    // Acción del botón
${spaces}  },
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`;
          break;
        default:
          buttonWidget = `${spaces}ElevatedButton(
${spaces}  onPressed: () {
${spaces}    // Acción del botón
${spaces}  },
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`;
      }
      widgetCode = buttonWidget;
      break;

    case COMPONENT_TYPES.CONTAINER:
      const padding = component.properties.padding || 16;
      const color = component.properties.color || "#FFFFFF";
      const borderRadius = component.style?.borderRadius || 0;

      let containerCode = `${spaces}Container(
${spaces}  padding: EdgeInsets.all(${padding}),
${
  color !== "#FFFFFF"
    ? `${spaces}  decoration: BoxDecoration(\n${spaces}    color: Color(0xFF${color.substring(1)}),\n${
        borderRadius > 0 ? `${spaces}    borderRadius: BorderRadius.circular(${borderRadius}),\n` : ""
      }${spaces}  ),\n`
    : borderRadius > 0
    ? `${spaces}  decoration: BoxDecoration(\n${spaces}    borderRadius: BorderRadius.circular(${borderRadius}),\n${spaces}  ),\n`
    : ""
}`;

      if (component.children.length > 0) {
        if (component.children.length === 1) {
          containerCode += `${spaces}  child: ${generateFlutterCodeTest(component.children[0], indent + 2).trim()},\n`;
        } else {
          containerCode += `${spaces}  child: Column(
${spaces}    children: [
${component.children.map((child) => generateFlutterCodeTest(child, indent + 6)).join(",\n")}
${spaces}    ],
${spaces}  ),\n`;
        }
      }

      containerCode += `${spaces})`;
      widgetCode = containerCode;
      break;

    case COMPONENT_TYPES.STACK:
      let stackCode = `${spaces}Stack(
${spaces}  alignment: Alignment.${component.properties.alignment || "center"},
${spaces}  children: [`;

      if (component.children.length > 0) {
        stackCode += `\n${component.children
          .map((child) => generateFlutterCodeTest(child, indent + 4))
          .join(",\n")}\n${spaces}  `;
      }

      stackCode += `],
${spaces})`;
      widgetCode = stackCode;
      break;

    case COMPONENT_TYPES.CARD:
      let cardCode = `${spaces}Card(
${spaces}  elevation: 2.0,
${spaces}  shape: RoundedRectangleBorder(
${spaces}    borderRadius: BorderRadius.circular(${component.style?.borderRadius || 8}),
${spaces}  ),
${spaces}  child: Padding(
${spaces}    padding: const EdgeInsets.all(16.0),
${spaces}    child: Column(
${spaces}      crossAxisAlignment: CrossAxisAlignment.start,
${spaces}      mainAxisSize: MainAxisSize.min,
${spaces}      children: [
${spaces}        Text(
${spaces}          '${(component.properties.title || "Card Title").replace(/'/g, "\\'")}',
${spaces}          style: TextStyle(
${spaces}            fontWeight: FontWeight.bold,
${spaces}          ),
${spaces}        ),
${spaces}        SizedBox(height: 8),
${spaces}        Text('${(component.properties.content || "Card content goes here").replace(/'/g, "\\'")}'),`;

      if (component.children.length > 0) {
        cardCode += `\n${spaces}        SizedBox(height: 8),`;
        cardCode += `\n${component.children.map((child) => generateFlutterCodeTest(child, indent + 8)).join(",\n")}`;
      }

      cardCode += `\n${spaces}      ],
${spaces}    ),
${spaces}  ),
${spaces})`;
      widgetCode = cardCode;
      break;

    case COMPONENT_TYPES.TEXT_FIELD:
      const textFieldId = component.id.replace(/[^a-zA-Z0-9]/g, "");
      widgetCode = `${spaces}TextField(
${spaces}  controller: _textController${textFieldId},
${spaces}  decoration: InputDecoration(
${spaces}    labelText: '${(component.properties.label || "Label").replace(/'/g, "\\'")}',
${spaces}    hintText: '${(component.properties.hint || "").replace(/'/g, "\\'")}',
${spaces}    border: OutlineInputBorder(
${spaces}      borderRadius: BorderRadius.circular(${component.style?.borderRadius || 4}),
${spaces}    ),
${spaces}  ),
${spaces})`;
      break;

    case COMPONENT_TYPES.CHECKBOX:
      const checkboxId = component.id.replace(/[^a-zA-Z0-9]/g, "");
      widgetCode = `${spaces}Row(
${spaces}  children: [
${spaces}    Checkbox(
${spaces}      value: _checkbox${checkboxId},
${spaces}      onChanged: (value) {
${spaces}        setState(() {
${spaces}          _checkbox${checkboxId} = value ?? false;
${spaces}        });
${spaces}      },
${spaces}    ),
${spaces}    SizedBox(width: 8),
${spaces}    Text('${(component.properties.label || "Checkbox").replace(/'/g, "\\'")}'),
${spaces}  ],
${spaces})`;
      break;

    case COMPONENT_TYPES.SWITCH:
      const switchId = component.id.replace(/[^a-zA-Z0-9]/g, "");
      widgetCode = `${spaces}Switch(
${spaces}  value: _switch${switchId},
${spaces}  onChanged: (value) {
${spaces}    setState(() {
${spaces}      _switch${switchId} = value;
${spaces}    });
${spaces}  },
${spaces})`;
      break;

    case COMPONENT_TYPES.RADIO:
      const radioId = component.id.replace(/[^a-zA-Z0-9]/g, "");
      widgetCode = `${spaces}Row(
${spaces}  children: [
${spaces}    Radio<String>(
${spaces}      value: '${component.properties.value || "option"}',
${spaces}      groupValue: _radio${radioId},
${spaces}      onChanged: (value) {
${spaces}        setState(() {
${spaces}          _radio${radioId} = value;
${spaces}        });
${spaces}      },
${spaces}    ),
${spaces}    SizedBox(width: 8),
${spaces}    Text('${(component.properties.label || "Radio Button").replace(/'/g, "\\'")}'),
${spaces}  ],
${spaces})`;
      break;

    case COMPONENT_TYPES.ICON:
      const iconName = component.properties.icon || "star";
      widgetCode = `${spaces}Icon(
${spaces}  Icons.${iconName},
${spaces}  size: ${component.properties.size || 24},
${component.style?.color ? `${spaces}  color: Color(0xFF${component.style.color.substring(1)}),\n` : ""}${spaces})`;
      break;

    case COMPONENT_TYPES.LIST_VIEW:
      const scrollDirection = component.properties.scrollDirection || "vertical";
      const itemCount = component.properties.itemCount || 3;

      let listViewCode = `${spaces}ListView.builder(
${spaces}  scrollDirection: Axis.${scrollDirection},
${spaces}  itemCount: ${itemCount},
${spaces}  itemBuilder: (context, index) {
${spaces}    return Padding(
${spaces}      padding: const EdgeInsets.all(8.0),
${spaces}      child: Container(
${spaces}        padding: const EdgeInsets.all(16.0),
${spaces}        decoration: BoxDecoration(
${spaces}          color: Colors.grey[200],
${spaces}          borderRadius: BorderRadius.circular(4),
${spaces}        ),
${spaces}        child: Text('List Item \${index + 1}'),
${spaces}      ),
${spaces}    );
${spaces}  },
${spaces})`;

      if (component.children.length > 0) {
        listViewCode = `${spaces}Column(
${spaces}  children: [
${spaces}    ${listViewCode.trim()},
${component.children.map((child) => generateFlutterCodeTest(child, indent + 4)).join(",\n")}
${spaces}  ],
${spaces})`;
      }

      widgetCode = listViewCode;
      break;

    default:
      widgetCode = `${spaces}// Unknown component type: ${component.type}`;
  }

  if (component.position) {
    const { x, y } = component.position;
    const posSpaces = " ".repeat(indent);
    widgetCode = `${posSpaces}Positioned(
${posSpaces}  left: ${Math.trunc(x)},
${posSpaces}  top: ${Math.trunc(y)},
${posSpaces}  child: SizedBox(
${posSpaces}    width: ${component.style?.width || "null"},
${posSpaces}    height: ${component.style?.height || "null"},
${posSpaces}    child: ${widgetCode
      .trim()
      .split("\n")
      .map((line) => `${posSpaces}      ${line.trim()}`)
      .join("\n")},
${posSpaces}  ),
${posSpaces})`;
  }

  return widgetCode;
}

export function exportFlutterCodeTest(pages: Page[]): string {
  const imports = `import 'package:flutter/material.dart';\n\n`;

  const mainFunction = `
  void main() {
    runApp(const MyApp());
  }

  class MyApp extends StatelessWidget {
    const MyApp({Key? key}) : super(key: key);

    @override
    Widget build(BuildContext context) {
      return MaterialApp(
        title: 'Flutter UI Designer App',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
          useMaterial3: true,
        ),
        home: const HomePage(),
      );
    }
  }

  ${getPages(pages)}
`;

  return imports + mainFunction;
}

export const getPages = (pages: Page[]) => {
  return `
    class HomePage extends StatelessWidget {
      const HomePage({super.key});

        @override
        Widget build(BuildContext context) {
        return Scaffold(
          appBar: AppBar(title: const Text('Página Principal')),
          drawer: Drawer(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                const DrawerHeader(
                  decoration: BoxDecoration(color: Colors.blue),
                  child: Text(
                    'Menú de navegación',
                    style: TextStyle(color: Colors.white, fontSize: 20),
                  ),
                ),
                ${pages.map(generateList).join("\n")}
              ],
            ),
          ),
          body: const Center(child: Text('¡Bienvenido a la página principal!')),
        );
        }
    }

    ${pages.map(generatePage).join("\n")}
  `;
};

const generateList = (page: Page): string => {
  const pageNameCapitalized = getPageNameCapitalized(page);

  return `
    ListTile(
      leading: const Icon(Icons.person),
      title: const Text('${pageNameCapitalized}'),
      onTap: () {
        Navigator.pop(context);
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ${pageNameCapitalized}()),
        );
      },
    ),
  `;
};

const generatePage = (page: Page): string => {
  const pageName = getPageNameCapitalized(page);
  const needsState = pageNeedsState(page.componentTree);

  if (needsState) {
    // Generar StatefulWidget
    return `
class ${pageName} extends StatefulWidget {
  const ${pageName}({super.key});

  @override
  State<${pageName}> createState() => _${pageName}State();
}

class _${pageName}State extends State<${pageName}> {
  // Variables de estado
${generateStateVariables(page.componentTree, 2)}

  ${generateDisposeMethod(page.componentTree, 2)}
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${pageName}')),
      body: ${getBodyContent(page.componentTree)},
    );
  }
}`;
  } else {
    // Generar StatelessWidget
    return `
class ${pageName} extends StatelessWidget {
  const ${pageName}({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${pageName}')),
      body: ${getBodyContent(page.componentTree)},
    );
  }
}`;
  }
};

// Crea el contenido del body según si hay Positioned
const getBodyContent = (componentTree: ComponentNode): string => {
  const children = componentTree.children;

  // Sin componentes
  if (children.length === 0) {
    return `SafeArea(
  child: SingleChildScrollView(
    child: Center(
      child: Text(
        'No components added',
        style: TextStyle(fontSize: 16, color: Colors.grey),
      ),
    ),
  ),
)`;
  }

  // Si alguno tiene posición, usar Stack
  const hasPositioned = children.some((child) => !!child.position);
  if (hasPositioned) {
    const widgets = children.map((child) => generateFlutterCodeTest(child, 12).trim()).join(",\n");
    return `SafeArea(
  child: SingleChildScrollView(
    child: SizedBox(
      width: double.infinity,
      // Ajusta la altura según contenido o configura dinámicamente
      height: 800,
      child: Stack(
        children: [
          ${widgets}
        ],
      ),
    ),
  ),
)`;
  }

  // Un solo hijo sin posición: centrado
  if (children.length === 1) {
    return `SafeArea(
  child: SingleChildScrollView(
    child: ${generateFlutterCodeTest(children[0], 10).trim()}
  ),
)`;
  }

  // Varias sin posición: Column normal
  const childrenWidgets = children.map((child) => generateFlutterCodeTest(child, 14)).join(",\n");
  return `SafeArea(
  child: SingleChildScrollView(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ${childrenWidgets}
      ],
    ),
  ),
)`;
};

function capitalizar(palabra: string): string {
  if (!palabra) return palabra;
  return palabra[0].toUpperCase() + palabra.slice(1).toLowerCase();
}

function getPageNameCapitalized(page: Page): string {
  return capitalizar(page.name);
}
