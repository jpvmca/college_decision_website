'use client';

import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Heading2, Heading3, Italic, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline, Undo2 } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Rich text editor for long profile text (About, Admissions). TipTap (ProseMirror) with a small, safe schema:
 * paragraphs, h2/h3, bold/italic/underline/strike, lists, quote and divider. Links are not available
 * (the backend also rejects website addresses). The backend sanitizes again on submit.
 */
export default function RichTextEditor({ value, onChange, placeholder, ariaLabel, minHeight = 320 }: {
  value: string; onChange: (html: string, text: string) => void; placeholder?: string; ariaLabel: string; minHeight?: number;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: false
      }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing…' })
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'cp3-prose', 'aria-label': ariaLabel, role: 'textbox', 'aria-multiline': 'true', style: `min-height:${minHeight}px` },
      // Strip anchors on paste so a copied web page does not bring links in.
      transformPastedHTML: (html) => html.replace(/<a\b[^>]*>/gi, '').replace(/<\/a>/gi, '')
    },
    onUpdate: ({ editor: e }) => onChange(e.isEmpty ? '' : e.getHTML(), e.getText())
  });

  // Reset from outside (e.g. "Discard changes").
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value !== (editor.isEmpty ? '' : editor.getHTML())) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  return <div className="cp3-editor">
    <Toolbar editor={editor} />
    {editor ? <EditorContent editor={editor} /> : <div className="cp3-prose cp3-prose-loading" style={{ minHeight }}>Loading editor…</div>}
  </div>;
}

function Toolbar({ editor }: { editor: Editor | null }) {
  const btn = (label: string, icon: React.ReactNode, run: () => void, active = false, disabled = false) =>
    <button type="button" className={active ? 'on' : ''} title={label} aria-label={label} aria-pressed={active} disabled={!editor || disabled} onMouseDown={(e) => e.preventDefault()} onClick={run}>{icon}</button>;
  const chain = () => editor!.chain().focus();
  return <div className="cp3-toolbar" role="toolbar" aria-label="Formatting">
    {btn('Heading', <Heading2 size={17} />, () => chain().toggleHeading({ level: 2 }).run(), editor?.isActive('heading', { level: 2 }))}
    {btn('Sub-heading', <Heading3 size={17} />, () => chain().toggleHeading({ level: 3 }).run(), editor?.isActive('heading', { level: 3 }))}
    <span className="sep" />
    {btn('Bold (Ctrl+B)', <Bold size={16} />, () => chain().toggleBold().run(), editor?.isActive('bold'))}
    {btn('Italic (Ctrl+I)', <Italic size={16} />, () => chain().toggleItalic().run(), editor?.isActive('italic'))}
    {btn('Underline (Ctrl+U)', <Underline size={16} />, () => chain().toggleUnderline().run(), editor?.isActive('underline'))}
    {btn('Strikethrough', <Strikethrough size={16} />, () => chain().toggleStrike().run(), editor?.isActive('strike'))}
    <span className="sep" />
    {btn('Bulleted list', <List size={17} />, () => chain().toggleBulletList().run(), editor?.isActive('bulletList'))}
    {btn('Numbered list', <ListOrdered size={17} />, () => chain().toggleOrderedList().run(), editor?.isActive('orderedList'))}
    {btn('Quote', <Quote size={16} />, () => chain().toggleBlockquote().run(), editor?.isActive('blockquote'))}
    {btn('Divider', <Minus size={17} />, () => chain().setHorizontalRule().run())}
    <span className="grow" />
    {btn('Undo (Ctrl+Z)', <Undo2 size={16} />, () => chain().undo().run(), false, !editor?.can().undo())}
    {btn('Redo (Ctrl+Shift+Z)', <Redo2 size={16} />, () => chain().redo().run(), false, !editor?.can().redo())}
  </div>;
}
