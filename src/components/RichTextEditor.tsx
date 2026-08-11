import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  icon: string;
};

function ToolbarButton({ onClick, active, title, icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`
        flex items-center justify-center w-7 h-7 rounded text-sm
        border border-transparent transition-colors
        ${
          active
            ? "bg-white border-gray-300 text-gray-900"
            : "text-gray-500 hover:bg-white hover:border-gray-200 hover:text-gray-800"
        }
      `}
    >
      <i className={`ti ${icon}`} aria-hidden="true" />
    </button>
  );
}

function Separator() {
  return <div className="w-px h-5 bg-gray-200 mx-1 self-center" />;
}

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Write newsletter content...",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded overflow-hidden mb-2">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <ToolbarButton
          title="Bold"
          icon="ti-bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          title="Italic"
          icon="ti-italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          title="Underline"
          icon="ti-underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          title="Strikethrough"
          icon="ti-strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <Separator />

        <ToolbarButton
          title="Heading 2"
          icon="ti-h-2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          title="Heading 3"
          icon="ti-h-3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />

        <Separator />

        <ToolbarButton
          title="Bullet list"
          icon="ti-list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          title="Ordered list"
          icon="ti-list-numbers"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />

        <Separator />

        <ToolbarButton
          title="Blockquote"
          icon="ti-quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          title="Code block"
          icon="ti-code"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />

        <Separator />

        <ToolbarButton
          title="Undo"
          icon="ti-arrow-back-up"
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          title="Redo"
          icon="ti-arrow-forward-up"
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="min-h-[150px] px-3 py-2 text-sm [&_.tiptap]:outline-none [&_.tiptap]:min-h-[130px]"
      />
    </div>
  );
}
