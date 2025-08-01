# Guia de Exportação de PDF no Capacitor

## Problema Resolvido

O Capacitor tem limitações com exportação de PDF usando `@react-pdf/renderer` porque o `PDFDownloadLink` depende do navegador para download, e no ambiente móvel isso não funciona como esperado.

## Solução Implementada

### 1. Plugins Instalados
- `@capacitor/filesystem`: Para salvar arquivos no dispositivo
- `@capacitor/share`: Para compartilhar arquivos

### 2. Utilitário de PDF (`src/lib/pdfUtils.ts`)
- Detecta automaticamente se está no ambiente móvel
- No web: usa o comportamento padrão do `PDFDownloadLink`
- No móvel: gera o PDF como blob, salva no filesystem e compartilha

### 3. Componentes Modificados
- `DownloadPDFButton`: Para planos alimentares
- `ShoppingListPage`: Para lista de compras
- `PDFExportButton`: Componente reutilizável

## Como Usar

### Opção 1: Usar o componente reutilizável
```tsx
import PDFExportButton from '../components/common/PDFExportButton';

<PDFExportButton
  document={<MeuPDFComponent data={data} />}
  fileName="meu-arquivo.pdf"
  title="Baixar PDF"
/>
```

### Opção 2: Usar diretamente o utilitário
```tsx
import { exportPDF } from '../lib/pdfUtils';

const handleExport = async () => {
  try {
    await exportPDF(<MeuPDFComponent data={data} />, 'arquivo.pdf');
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

## Comportamento

### No Web
- Usa `PDFDownloadLink` do `@react-pdf/renderer`
- Download direto pelo navegador

### No Móvel (Capacitor)
- Gera PDF como blob
- Salva no diretório Documents do dispositivo
- Abre o menu de compartilhamento nativo
- Permite salvar, compartilhar ou imprimir

## Permissões Necessárias

### Android
Adicione ao `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### iOS
Adicione ao `ios/App/App/Info.plist`:
```xml
<key>NSDocumentsFolderUsageDescription</key>
<string>Este app precisa acessar documentos para salvar PDFs</string>
```

## Testando

1. **Web**: Execute `npm run dev` e teste no navegador
2. **Android**: Execute `npx cap run android`
3. **iOS**: Execute `npx cap run ios`

## Troubleshooting

### Erro de permissão no Android
- Verifique se as permissões estão no AndroidManifest.xml
- No Android 11+, pode ser necessário usar `Directory.ExternalStorage`

### PDF não aparece no compartilhamento
- Verifique se o arquivo foi salvo corretamente
- Use `console.log` para debugar o caminho do arquivo

### Erro no iOS
- Verifique se as permissões estão no Info.plist
- Teste em dispositivo físico (simulador pode ter limitações) 