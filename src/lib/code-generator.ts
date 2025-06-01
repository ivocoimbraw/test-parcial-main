"use client"

import type { ComponentNode, Page } from "@/lib/types"
import { COMPONENT_TYPES } from "@/lib/constants"


export function generateFlutterCodeTest(component: ComponentNode, indent = 0): string {
    const spaces = " ".repeat(indent)
    let widgetCode = "";

    switch (component.type) {
 
        case COMPONENT_TYPES.SLIDER:
            const sliderValue = component.properties.value || 50
            const sliderMin = component.properties.min || 0
            const sliderMax = component.properties.max || 100

            widgetCode = `${spaces}Column(
${spaces}  children: [
${spaces}    Slider(
${spaces}      value: ${sliderValue}.0,
${spaces}      min: ${sliderMin}.0,
${spaces}      max: ${sliderMax}.0,
${spaces}      onChanged: (value) {},
${spaces}    ),
${spaces}    Text('Value: ${sliderValue}'),
${spaces}  ],
${spaces})`
            break;
        case COMPONENT_TYPES.DROPDOWN_BUTTON:
            const dropdownOptions = component.properties.options || ["Option 1", "Option 2", "Option 3"]
            widgetCode = `${spaces}DropdownButton<String>(
${spaces}  value: '${dropdownOptions[0]}',
${spaces}  items: [
${dropdownOptions.map((option: string) => `${spaces}    DropdownMenuItem(\n${spaces}      value: '${option.replace(/'/g, "\\'")}',\n${spaces}      child: Text('${option.replace(/'/g, "\\'")}'),\n${spaces}    )`).join(",\n")}
${spaces}  ],
${spaces}  onChanged: (value) {},
${spaces})`
            break;
       
        case COMPONENT_TYPES.TABLE:
            const rows = component.properties.rows || 3
            const columns = component.properties.columns || 3
            const headers = component.properties.headers || Array.from({ length: columns }, (_, i) => `Column ${i + 1}`)

            widgetCode = `${spaces}Table(
${spaces}  border: TableBorder.all(),
${spaces}  children: [
${spaces}    TableRow(
${spaces}      decoration: BoxDecoration(color: Colors.grey[200]),
${spaces}      children: [
${headers.map((header: string) => `${spaces}        Padding(\n${spaces}          padding: EdgeInsets.all(8.0),\n${spaces}          child: Text(\n${spaces}            '${header.replace(/'/g, "\\'")}',\n${spaces}            style: TextStyle(fontWeight: FontWeight.bold),\n${spaces}          ),\n${spaces}        )`).join(",\n")}
${spaces}      ],
${spaces}    ),
${Array.from({ length: rows })
                    .map(
                        (_, rowIndex) =>
                            `${spaces}    TableRow(\n${spaces}      children: [\n${Array.from({ length: columns })
                                .map(
                                    (_, colIndex) =>
                                        `${spaces}        Padding(\n${spaces}          padding: EdgeInsets.all(8.0),\n${spaces}          child: Text('Row ${rowIndex + 1}, Col ${colIndex + 1}'),\n${spaces}        )`,
                                )
                                .join(",\n")}\n${spaces}      ],\n${spaces}    )`,
                    )
                    .join(",\n")}
${spaces}  ],
${spaces})`
                    break;
        case COMPONENT_TYPES.TEXT:
            widgetCode = `${spaces}Text(
${spaces}  '${(component.properties.text || "Text").replace(/'/g, "\\'")}',
${spaces}  style: TextStyle(
${spaces}    fontSize: ${component.style?.fontSize || 16},
${component.style?.color ? `${spaces}    color: Color(0xFF${component.style.color.substring(1)}),\n` : ""}${spaces}  ),
${spaces})`
                    break;
        case COMPONENT_TYPES.BUTTON:
            const buttonVariant = component.properties.variant || "primary"
            let buttonWidget = ""
            switch (buttonVariant) {
                case "primary":
                    buttonWidget = `${spaces}ElevatedButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
                    break
                case "outline":
                    buttonWidget = `${spaces}OutlinedButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
                    break
                case "text":
                    buttonWidget = `${spaces}TextButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
                    break
                default:
                    buttonWidget = `${spaces}ElevatedButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
            }

            widgetCode = buttonWidget
            break;
        case COMPONENT_TYPES.CONTAINER:
            const padding = component.properties.padding || 16
            const color = component.properties.color || "#FFFFFF"
            const borderRadius = component.style?.borderRadius || 0

            let containerCode = `${spaces}Container(
${spaces}  padding: EdgeInsets.all(${padding}),
${color !== "#FFFFFF" ? `${spaces}  decoration: BoxDecoration(\n${spaces}    color: Color(0xFF${color.substring(1)}),\n${borderRadius > 0 ? `${spaces}    borderRadius: BorderRadius.circular(${borderRadius}),\n` : ""}${spaces}  ),\n` : borderRadius > 0 ? `${spaces}  decoration: BoxDecoration(\n${spaces}    borderRadius: BorderRadius.circular(${borderRadius}),\n${spaces}  ),\n` : ""}`

            if (component.children.length > 0) {
                if (component.children.length === 1) {
                    containerCode += `${spaces}  child: ${generateFlutterCode(component.children[0], indent + 2).trim()},\n`
                } else {
                    containerCode += `${spaces}  child: Column(
${spaces}    children: [
${component.children.map((child) => generateFlutterCode(child, indent + 6)).join(",\n")}
${spaces}    ],
${spaces}  ),\n`
                }
            }

            containerCode += `${spaces})`
            widgetCode = containerCode
            break;
        
        case COMPONENT_TYPES.STACK:
            let stackCode = `${spaces}Stack(
${spaces}  alignment: Alignment.${component.properties.alignment || "center"},
${spaces}  children: [`

            if (component.children.length > 0) {
                stackCode += `\n${component.children.map((child) => generateFlutterCode(child, indent + 4)).join(",\n")}\n${spaces}  `
            }

            stackCode += `],
${spaces})`
            widgetCode = stackCode
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
${spaces}        Text('${(component.properties.content || "Card content goes here").replace(/'/g, "\\'")}'),`

            if (component.children.length > 0) {
                cardCode += `\n${spaces}        SizedBox(height: 8),`
                cardCode += `\n${component.children.map((child) => generateFlutterCode(child, indent + 8)).join(",\n")}`
            }

            cardCode += `\n${spaces}      ],
${spaces}    ),
${spaces}  ),
${spaces})`
            widgetCode = cardCode
            break;
        case COMPONENT_TYPES.TEXT_FIELD:
            widgetCode = `${spaces}TextField(
${spaces}  decoration: InputDecoration(
${spaces}    labelText: '${(component.properties.hint || "Label").replace(/'/g, "\\'")}',
${spaces}    border: OutlineInputBorder(
${spaces}      borderRadius: BorderRadius.circular(${component.style?.borderRadius || 4}),
${spaces}    ),
${spaces}  ),
${spaces})`
            break;
        case COMPONENT_TYPES.CHECKBOX:
            widgetCode = `${spaces}Row(
${spaces}  children: [
${spaces}    Checkbox(
${spaces}      value: ${component.properties.value ? "true" : "false"},
${spaces}      onChanged: (value) {},
${spaces}    ),
${spaces}    SizedBox(width: 8),
${spaces}    Text('${(component.properties.label || "Checkbox").replace(/'/g, "\\'")}'),
${spaces}  ],
${spaces})`
            break;
        case COMPONENT_TYPES.SWITCH:
            widgetCode = `${spaces}Switch(
${spaces}  value: ${component.properties.value ? "true" : "false"},
${spaces}  onChanged: (value) {},
${spaces})`
            break;
        case COMPONENT_TYPES.RADIO:
            widgetCode = `${spaces}Row(
${spaces}  children: [
${spaces}    Radio<String>(
${spaces}      value: '${component.properties.value || "option"}',
${spaces}      groupValue: '${component.properties.groupValue || "option"}',
${spaces}      onChanged: (value) {},
${spaces}    ),
${spaces}    SizedBox(width: 8),
${spaces}    Text('${(component.properties.label || "Radio Button").replace(/'/g, "\\'")}'),
${spaces}  ],
${spaces})`
            break;
        case COMPONENT_TYPES.ICON:
            const iconName = component.properties.icon || "star"
            widgetCode = `${spaces}Icon(
${spaces}  Icons.${iconName},
${spaces}  size: ${component.properties.size || 24},
${component.style?.color ? `${spaces}  color: Color(0xFF${component.style.color.substring(1)}),\n` : ""}${spaces})`
            break;
        case COMPONENT_TYPES.LIST_VIEW:
            const scrollDirection = component.properties.scrollDirection || "vertical"
            const itemCount = component.properties.itemCount || 3

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
${spaces})`

            if (component.children.length > 0) {
                listViewCode = `${spaces}Column(
${spaces}  children: [
${spaces}    ${listViewCode.trim()},
${component.children.map((child) => generateFlutterCode(child, indent + 4)).join(",\n")}
${spaces}  ],
${spaces})`
            }

            widgetCode = listViewCode
            break;
        default:
            widgetCode = `${spaces}// Unknown component type: ${component.type}`
    }

    if (component.position) {
        const { x, y } = component.position;
        const posSpaces = " ".repeat(indent);
        widgetCode = `${posSpaces}Positioned(
${posSpaces}  left: ${Math.trunc(x)},
${posSpaces}  top: ${Math.trunc(y)},
${posSpaces}  child: \
SizedBox(
                    width: ${component.style?.width || "30"},
                    height: ${component.style?.height || "30"},
                    child:   
${widgetCode.trim().split("\n").map(line => `${posSpaces}    ${line.trim()}`).join("\n")},
    )
${posSpaces})`;
    }

    return widgetCode;

}


// Generate Flutter code for a component with proper nesting
export function generateFlutterCode(component: ComponentNode, indent = 0): string {
  const spaces = " ".repeat(indent)
  let widgetCode = "";

  switch (component.type) {

    case COMPONENT_TYPES.SLIDER:
      const sliderValue = component.properties.value || 50
      const sliderMin = component.properties.min || 0
      const sliderMax = component.properties.max || 100

      return `${spaces}Column(
${spaces}  children: [
${spaces}    Slider(
${spaces}      value: ${sliderValue}.0,
${spaces}      min: ${sliderMin}.0,
${spaces}      max: ${sliderMax}.0,
${spaces}      onChanged: (value) {},
${spaces}    ),
${spaces}    Text('Value: ${sliderValue}'),
${spaces}  ],
${spaces})`

    case COMPONENT_TYPES.DROPDOWN_BUTTON:
      const dropdownOptions = component.properties.options || ["Option 1", "Option 2", "Option 3"]
      return `${spaces}DropdownButton<String>(
${spaces}  value: '${dropdownOptions[0]}',
${spaces}  items: [
${dropdownOptions.map((option: string) => `${spaces}    DropdownMenuItem(\n${spaces}      value: '${option.replace(/'/g, "\\'")}',\n${spaces}      child: Text('${option.replace(/'/g, "\\'")}'),\n${spaces}    )`).join(",\n")}
${spaces}  ],
${spaces}  onChanged: (value) {},
${spaces})`

    case COMPONENT_TYPES.TABLE:
      const rows = component.properties.rows || 3
      const columns = component.properties.columns || 3
      const headers = component.properties.headers || Array.from({ length: columns }, (_, i) => `Column ${i + 1}`)

      return `${spaces}Table(
${spaces}  border: TableBorder.all(),
${spaces}  children: [
${spaces}    TableRow(
${spaces}      decoration: BoxDecoration(color: Colors.grey[200]),
${spaces}      children: [
${headers.map((header: string) => `${spaces}        Padding(\n${spaces}          padding: EdgeInsets.all(8.0),\n${spaces}          child: Text(\n${spaces}            '${header.replace(/'/g, "\\'")}',\n${spaces}            style: TextStyle(fontWeight: FontWeight.bold),\n${spaces}          ),\n${spaces}        )`).join(",\n")}
${spaces}      ],
${spaces}    ),
${Array.from({ length: rows })
          .map(
            (_, rowIndex) =>
              `${spaces}    TableRow(\n${spaces}      children: [\n${Array.from({ length: columns })
                .map(
                  (_, colIndex) =>
                    `${spaces}        Padding(\n${spaces}          padding: EdgeInsets.all(8.0),\n${spaces}          child: Text('Row ${rowIndex + 1}, Col ${colIndex + 1}'),\n${spaces}        )`,
                )
                .join(",\n")}\n${spaces}      ],\n${spaces}    )`,
          )
          .join(",\n")}
${spaces}  ],
${spaces})`

    case COMPONENT_TYPES.TEXT:
      return `${spaces}Text(
${spaces}  '${(component.properties.text || "Text").replace(/'/g, "\\'")}',
${spaces}  style: TextStyle(
${spaces}    fontSize: ${component.style?.fontSize || 16},
${component.style?.color ? `${spaces}    color: Color(0xFF${component.style.color.substring(1)}),\n` : ""}${spaces}  ),
${spaces})`

    case COMPONENT_TYPES.BUTTON:
      const buttonVariant = component.properties.variant || "primary"
      let buttonWidget = ""

      switch (buttonVariant) {
        case "primary":
          buttonWidget = `${spaces}ElevatedButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
          break
        case "outline":
          buttonWidget = `${spaces}OutlinedButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
          break
        case "text":
          buttonWidget = `${spaces}TextButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
          break
        default:
          buttonWidget = `${spaces}ElevatedButton(
${spaces}  onPressed: () {},
${spaces}  child: Text('${(component.properties.text || "Button").replace(/'/g, "\\'")}'),
${spaces})`
      }

      return buttonWidget

    case COMPONENT_TYPES.CONTAINER:
      const padding = component.properties.padding || 16
      const color = component.properties.color || "#FFFFFF"
      const borderRadius = component.style?.borderRadius || 0

      let containerCode = `${spaces}Container(
${spaces}  padding: EdgeInsets.all(${padding}),
${color !== "#FFFFFF" ? `${spaces}  decoration: BoxDecoration(\n${spaces}    color: Color(0xFF${color.substring(1)}),\n${borderRadius > 0 ? `${spaces}    borderRadius: BorderRadius.circular(${borderRadius}),\n` : ""}${spaces}  ),\n` : borderRadius > 0 ? `${spaces}  decoration: BoxDecoration(\n${spaces}    borderRadius: BorderRadius.circular(${borderRadius}),\n${spaces}  ),\n` : ""}`

      if (component.children.length > 0) {
        if (component.children.length === 1) {
          containerCode += `${spaces}  child: ${generateFlutterCode(component.children[0], indent + 2).trim()},\n`
        } else {
          containerCode += `${spaces}  child: Column(
${spaces}    children: [
${component.children.map((child) => generateFlutterCode(child, indent + 6)).join(",\n")}
${spaces}    ],
${spaces}  ),\n`
        }
      }

      containerCode += `${spaces})`
      return containerCode


    case COMPONENT_TYPES.STACK:
      let stackCode = `${spaces}Stack(
${spaces}  alignment: Alignment.${component.properties.alignment || "center"},
${spaces}  children: [`

      if (component.children.length > 0) {
        stackCode += `\n${component.children.map((child) => generateFlutterCode(child, indent + 4)).join(",\n")}\n${spaces}  `
      }

      stackCode += `],
${spaces})`
      return stackCode

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
${spaces}        Text('${(component.properties.content || "Card content goes here").replace(/'/g, "\\'")}'),`

      if (component.children.length > 0) {
        cardCode += `\n${spaces}        SizedBox(height: 8),`
        cardCode += `\n${component.children.map((child) => generateFlutterCode(child, indent + 8)).join(",\n")}`
      }

      cardCode += `\n${spaces}      ],
${spaces}    ),
${spaces}  ),
${spaces})`
      return cardCode

    case COMPONENT_TYPES.TEXT_FIELD:
      return `${spaces}TextField(
${spaces}  decoration: InputDecoration(
${spaces}    labelText: '${(component.properties.label || "Label").replace(/'/g, "\\'")}',
${spaces}    hintText: '${(component.properties.hint || "").replace(/'/g, "\\'")}',
${spaces}    border: OutlineInputBorder(
${spaces}      borderRadius: BorderRadius.circular(${component.style?.borderRadius || 4}),
${spaces}    ),
${spaces}  ),
${spaces})`

    case COMPONENT_TYPES.CHECKBOX:
      return `${spaces}Row(
${spaces}  children: [
${spaces}    Checkbox(
${spaces}      value: ${component.properties.value ? "true" : "false"},
${spaces}      onChanged: (value) {},
${spaces}    ),
${spaces}    SizedBox(width: 8),
${spaces}    Text('${(component.properties.label || "Checkbox").replace(/'/g, "\\'")}'),
${spaces}  ],
${spaces})`

    case COMPONENT_TYPES.SWITCH:
      return `${spaces}Switch(
${spaces}  value: ${component.properties.value ? "true" : "false"},
${spaces}  onChanged: (value) {},
${spaces})`

    case COMPONENT_TYPES.RADIO:
      return `${spaces}Row(
${spaces}  children: [
${spaces}    Radio<String>(
${spaces}      value: '${component.properties.value || "option"}',
${spaces}      groupValue: '${component.properties.groupValue || "option"}',
${spaces}      onChanged: (value) {},
${spaces}    ),
${spaces}    SizedBox(width: 8),
${spaces}    Text('${(component.properties.label || "Radio Button").replace(/'/g, "\\'")}'),
${spaces}  ],
${spaces})`

    case COMPONENT_TYPES.ICON:
      const iconName = component.properties.icon || "star"
      return `${spaces}Icon(
${spaces}  Icons.${iconName},
${spaces}  size: ${component.properties.size || 24},
${component.style?.color ? `${spaces}  color: Color(0xFF${component.style.color.substring(1)}),\n` : ""}${spaces})`

    case COMPONENT_TYPES.LIST_VIEW:
      const scrollDirection = component.properties.scrollDirection || "vertical"
      const itemCount = component.properties.itemCount || 3

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
${spaces})`

      if (component.children.length > 0) {
        listViewCode = `${spaces}Column(
${spaces}  children: [
${spaces}    ${listViewCode.trim()},
${component.children.map((child) => generateFlutterCode(child, indent + 4)).join(",\n")}
${spaces}  ],
${spaces})`
      }

      return listViewCode

    default:
      return `${spaces}// Unknown component type: ${component.type}`
  }
}

// Convert CSS alignment to Flutter alignment
function convertFlutterAlignment(alignment: string): string {
  switch (alignment) {
    case "start":
      return "start"
    case "center":
      return "center"
    case "end":
      return "end"
    case "spaceBetween":
      return "spaceBetween"
    case "spaceAround":
      return "spaceAround"
    case "spaceEvenly":
      return "spaceEvenly"
    default:
      return "start"
  }
}

// Generate the full Flutter code for the app with proper structure
/** NO SE ESTA USANDO ESTA FUNCION */
export function exportFlutterCode(componentTree: ComponentNode): string {
  const imports = `import 'package:flutter/material.dart';\n\n`

  // Generate a more complete and clean Flutter app structure
  const mainFunction = `void main() {
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
      home: const MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: ${componentTree.children.length > 0
      ? componentTree.children.length === 1
        ? generateFlutterCode(componentTree.children[0], 10).trim()
        : `Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
${componentTree.children.map((child) => generateFlutterCode(child, 14)).join(",\n")}
            ],
          )`
      : "const Center(\n            child: Text(\n              'No components added',\n              style: TextStyle(fontSize: 16, color: Colors.grey),\n            ),\n          )"
    }
        ),
      ),
    );
  }
}
`

  return imports + mainFunction
}

export function exportFlutterCodeTest(pages: Page[]): string {
  const imports = `import 'package:flutter/material.dart';\n\n`

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

`

  return imports + mainFunction
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
                ${pages.map(generateList).join('\n')}
              ],
            ),
          ),
          body: const Center(child: Text('¡Bienvenido a la página principal!')),
        );
        }
    }

    ${pages.map(generatePage).join('\n')}
  `
}

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
  `
}



const generatePage = (page: Page): string => {
  const pageName = getPageNameCapitalized(page);
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
}
`;
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
  const hasPositioned = children.some(child => !!child.position);
  if (hasPositioned) {
    const widgets = children
      .map(child => generateFlutterCodeTest(child, 12).trim())
      .join(',\n');
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
  const childrenWidgets = children
    .map(child => generateFlutterCodeTest(child, 14))
    .join(',\n');
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
