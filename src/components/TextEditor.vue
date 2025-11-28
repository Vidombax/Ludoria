<script setup>
  import { computed, ref, onMounted, watch } from 'vue'
  import { Ckeditor } from '@ckeditor/ckeditor5-vue'

  import {
    ClassicEditor,
    Autosave,
    Essentials,
    Paragraph,
    LinkImage,
    Link,
    ImageBlock,
    ImageToolbar,
    BlockQuote,
    Bold,
    CloudServices,
    ImageUpload,
    ImageInsertViaUrl,
    AutoImage,
    Table,
    TableToolbar,
    Heading,
    ImageTextAlternative,
    ImageCaption,
    ImageStyle,
    Indent,
    IndentBlock,
    ImageInline,
    Italic,
    List,
    TableCaption,
    Underline,
    MediaEmbed
  } from 'ckeditor5'

  import 'ckeditor5/ckeditor5.css'

  const LICENSE_KEY = import.meta.env.VITE_CKEDITOR_KEY;


  const emit = defineEmits(['text-editor']);
  const text = ref('');
  const setTextInEditor = (text) => {
    emit('text-editor', text);
  }

  const handleEditorUpdate = (value) => {
    text.value = value;
    setTextInEditor(value);
  };

  const isLayoutReady = ref(false);

  const editor = ClassicEditor;

  const config = computed(() => {
    if (!isLayoutReady.value) {
      return null;
    }

    return {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'heading',
          '|',
          'italic',
          'underline',
          '|',
          'link',
          'mediaEmbed',
          'insertTable',
          'blockQuote',
          '|',
          'bulletedList',
          'numberedList',
          'outdent',
          'indent'
        ],
        shouldNotGroupWhenFull: true
      },
      plugins: [
        AutoImage,
        Autosave,
        BlockQuote,
        Bold,
        CloudServices,
        Essentials,
        Heading,
        ImageBlock,
        ImageCaption,
        ImageInline,
        ImageInsertViaUrl,
        ImageStyle,
        ImageTextAlternative,
        ImageToolbar,
        ImageUpload,
        Indent,
        IndentBlock,
        Italic,
        Link,
        LinkImage,
        List,
        MediaEmbed,
        Paragraph,
        Table,
        TableCaption,
        TableToolbar,
        Underline
      ],
      heading: {
        options: [
          {
            model: 'paragraph',
            title: 'Абзац',
            class: 'ck-heading_paragraph'
          },
          {
            model: 'heading1',
            view: 'h1',
            title: 'Заголовок 1',
            class: 'ck-heading_heading1'
          },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Заголовок 2',
            class: 'ck-heading_heading2'
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Заголовок 3',
            class: 'ck-heading_heading3'
          },
          {
            model: 'heading4',
            view: 'h4',
            title: 'Заголовок 4',
            class: 'ck-heading_heading4'
          },
          {
            model: 'heading5',
            view: 'h5',
            title: 'Заголовок 5',
            class: 'ck-heading_heading5'
          },
          {
            model: 'heading6',
            view: 'h6',
            title: 'Заголовок 6',
            class: 'ck-heading_heading6'
          }
        ]
      },
      image: {
        toolbar: ['toggleImageCaption', 'imageTextAlternative', '|', 'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText']
      },
      initialData: text.value,
      licenseKey: LICENSE_KEY,
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
          toggleDownloadable: {
            mode: 'manual',
            label: 'Downloadable',
            attributes: {
              download: 'file'
            }
          }
        }
      },
      placeholder: 'Текст',
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
      }
    };
  });

  watch(() => text.value, (newValue) => {
    setTextInEditor(newValue);
  });

  onMounted(() => {
    isLayoutReady.value = true;
  });
</script>
<template>
  <div class="main-container">
    <div class="editor-container editor-container_classic-editor" ref="editorContainerElement">
      <div class="editor-container__editor">
        <div ref="editorElement">
          <ckeditor
              v-if="editor && config"
              :modelValue="config.initialData"
              :editor="editor"
              :config="config"
              @update:modelValue="handleEditorUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
