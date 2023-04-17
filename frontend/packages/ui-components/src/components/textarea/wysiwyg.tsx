import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {Editor, EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, {useCallback, useState} from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

import {ButtonIcon} from '../button';
import {
  IconBold,
  IconExpand,
  IconItalic,
  IconLinkSet,
  IconLinkUnset,
  IconListOrdered,
  IconListUnordered,
} from '../icons';

type MenuBarProps = {
  disabled: boolean;
  editor: Editor | null;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  fullScreen?: boolean;
};

const MenuBar: React.FC<MenuBarProps> = ({
  editor,
  disabled,
  isExpanded,
  setIsExpanded,
  fullScreen = false,
}) => {
  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // TODO: All possible url validations should be done here instead of just checking for protocol
    if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({href: `http://${url}`})
        .run();
    } else {
      editor
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({href: url})
        .run();
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <StyledMenuBar disabled={disabled} fullScreen={fullScreen}>
      <Toolgroup>
        <ButtonIcon
          icon={<IconBold />}
          mode="ghost"
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
        />
        <ButtonIcon
          icon={<IconItalic />}
          mode="ghost"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
        />
        <ButtonIcon
          icon={<IconLinkSet />}
          mode="ghost"
          isActive={editor.isActive('link')}
          onClick={setLink}
          disabled={disabled}
        />
        <ButtonIcon
          icon={<IconLinkUnset />}
          mode="ghost"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link') || disabled}
        />
        <ButtonIcon
          icon={<IconListOrdered />}
          mode="ghost"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
        />
        <ButtonIcon
          icon={<IconListUnordered />}
          mode="ghost"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
        />
      </Toolgroup>
      <ButtonIcon
        icon={<IconExpand />}
        mode="ghost"
        disabled={disabled}
        onClick={() => setIsExpanded(!isExpanded)}
      />
    </StyledMenuBar>
  );
};

export type TextareaWYSIWYGProps = {
  placeholder?: string;
  disabled?: boolean;
  onBlur?: (html: string) => void;
  onChange?: (html: string) => void;
  name?: string;
  value?: string;
};

export const TextareaWYSIWYG: React.FC<TextareaWYSIWYGProps> = ({
  placeholder = '',
  disabled = false,
  onBlur,
  onChange,
  name = '',
  value = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const editor = useEditor(
    {
      content: value,
      editable: !disabled,
      extensions: [
        StarterKit,
        Link,
        Placeholder.configure({
          placeholder,
        }),
      ],
      onBlur: ({editor}) => {
        if (onBlur) {
          onBlur(editor.getHTML());
        }
      },
      onUpdate: ({editor}) => {
        if (onChange) {
          onChange(editor.getHTML());
        }
      },
    },
    [disabled]
  );

  const body = document.querySelector('body');

  if (isExpanded) {
    document.onkeydown = e => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(!isExpanded);
      }
    };

    if (body) {
      body.style.overflow = 'hidden';
    }

    let portalNode = document.querySelector('#fullscreen-editor');
    if (!portalNode) {
      const div = document.createElement('div');
      div.id = 'fullscreen-editor';
      document.body.appendChild(div);
      portalNode = div;
    }

    const fullScreenEditor = (
      <Container disabled={disabled} fullScreen>
        <MenuBar
          disabled={disabled}
          editor={editor}
          fullScreen
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
        <StyledEditorContent name={name} editor={editor} />
      </Container>
    );

    return ReactDOM.createPortal(fullScreenEditor, portalNode);
  }

  if (body) {
    body.style.overflow = 'auto';
  }

  return (
    <Container disabled={disabled}>
      <MenuBar
        disabled={disabled}
        editor={editor}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <StyledEditorContent name={name} editor={editor} />
    </Container>
  );
};

type Props = {
  disabled: boolean;
  fullScreen?: boolean;
};

const Container = styled.div.attrs(({disabled, fullScreen = false}: Props) => ({
  className: `w-full text-ui-600 overflow-auto ${
    fullScreen
      ? 'h-screen flex flex-col fixed top-0'
      : 'rounded-xl border-2 border-ui-100 hover:border-ui-300 focus-within:ring-2 focus-within:ring-primary-500 active:border-primary-500 active:ring-0 '
  } ${disabled ? 'bg-ui-100 border-ui-200' : 'bg-white'}`,
}))<Props>`
  ::-webkit-input-placeholder {
    color: #9aa5b1;
  }
  ::-moz-placeholder {
    color: #9aa5b1;
  }
  :-ms-input-placeholder {
    color: #9aa5b1;
  }
  :-moz-placeholder {
    color: #9aa5b1;
  }
`;

const StyledMenuBar = styled.div.attrs(({disabled, fullScreen}: Props) => ({
  className: `bg-ui-50 px-2 py-1.5 flex flex-wrap justify-between ${
    fullScreen ? 'sticky top-0 z-10' : 'rounded-t-xl'
  } ${disabled ? 'bg-ui-100' : ''}`,
}))<Props>``;

const Toolgroup = styled.div.attrs({
  className: 'flex flex-wrap space-x-1.5',
})``;

const StyledEditorContent = styled(EditorContent)`
  flex: 1;

  .ProseMirror {
    padding: 12px 16px;
    height: 100%;
    min-height: 112px;

    :focus {
      outline: none;
    }

    ul {
      list-style-type: decimal;
      padding: 0 1rem;
    }

    ol {
      list-style-type: disc;
      padding: 0 1rem;
    }

    a {
      color: #003bf5;
      cursor: pointer;
      font-weight: 700;

      :hover {
        color: #0031ad;
      }
    }
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;
