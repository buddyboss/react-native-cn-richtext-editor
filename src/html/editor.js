const editorHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <style>
        html {
            height: 100%;
            width: 100%;
        }
        body {
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            height: 100%;
            margin: 0;
            padding: 2px;
        }
        code { 
            background-color: #eee;
            background: hsl(220, 80%, 90%);         
        }
        pre {
          white-space: pre-wrap;
          background: #eee;
          border: 1px solid #ddd;
          border-width: 1px;
          border-radius: 4px;
          margin: 5px;
          padding: 5px;      
          word-wrap: break-word;
      }
      blockquote {
          white-space: pre-wrap;
          border-left: 3px solid #ccc;
          margin: 5px;
          padding: 5px;      
          word-wrap: break-word;
      }
        
        #editor {
           flex-grow: 1;
        }

        #editor:focus {
          outline: 0px solid transparent;
        }
        
      [contenteditable][placeholder]:empty:before {
        content: attr(placeholder);
        position: absolute;
        opacity: .4;
        background-color: transparent;
      }
    </style>
    <style>
    /* PUT YOUR STYLE HERE */
    </style>
    <title>CN-Editor</title>
</head>
<body>
  <div id="editor" contenteditable placeholder="" oninput="if(this.innerHTML.trim()==='<br>')this.innerHTML=''" ></div>
    <script>
        var __DEV__ = !!${window.__DEV__};
        (function(doc) {
            var editor = document.getElementById('editor');
            editor.contentEditable = true;

            var selectedRange;

            console.log = function (){
              if(__DEV__) {
                sendMessage(
                  JSON.stringify({
                    type: 'LOG',
                    data: Array.prototype.slice.call(arguments)
                  })
                );
              }
            }

            var getSelectedStyles = function() {
                let styles = [];
                document.queryCommandState('bold') && styles.push('bold');
                document.queryCommandState('italic') && styles.push('italic');
                document.queryCommandState('underline') && styles.push('underline');
                document.queryCommandState('strikeThrough') && styles.push('lineThrough');

                var fColor = document.queryCommandValue('foreColor');
                var bgColor = document.queryCommandValue('backColor');
                var colors = {
                        color: fColor,
                        highlight: bgColor
                    };
                var stylesJson = JSON.stringify({
                    type: 'selectedStyles',
                    data: {styles, colors}});
                    sendMessage(stylesJson);
                

            }

            var sendMessage = function(message) {
              if(window.ReactNativeWebView)
                window.ReactNativeWebView.postMessage(message);
            }

            var getSelectedTag = function() {
                let tag = document.queryCommandValue('formatBlock');
                if(document.queryCommandState('insertUnorderedList'))
                    tag = 'ul';
                else if(document.queryCommandState('insertorderedlist'))
                    tag = 'ol';
                switch (tag) {
                    case 'h1':
                        tag = 'title';
                        break;
                        case 'h3':
                        tag = 'heading';
                        break;
                        case 'pre':
                        tag = 'codeblock';
                        break;
                        case 'blockquote':
                        tag = 'blockquote';
                        break;
                        case 'p':
                        tag = 'body';
                        break;
                    default:
                        break;
                }
                var stylesJson = JSON.stringify({
                    type: 'selectedTag',
                    data: tag});
                sendMessage(stylesJson);
            }

            editor.addEventListener('focus', function() {
                var focused = JSON.stringify({
                  type: 'onFocus',
                });
                sendMessage(focused);
            });

            editor.addEventListener('blur', function() {
                var blured = JSON.stringify({
                  type: 'onBlur'
                });
                sendMessage(blured);
            });

            document.addEventListener('selectionchange', function() {
                getSelectedStyles();
                getSelectedTag();
            });

            document.addEventListener("keydown", function() {
                if (event.key === 'Backspace' && (document.queryCommandValue('formatBlock') === 'blockquote' || document.queryCommandValue('formatBlock') === 'pre')) {
                    document.execCommand('formatBlock', false, 'div');
                }

                if (event.key === 'Enter' && document.queryCommandValue('formatBlock') === 'blockquote') {
                    event.preventDefault();
                    document.execCommand('insertText', false, '\\n');
                    document.execCommand('formatBlock', false, 'div');
                }
            });

            document.getElementById("editor").addEventListener("input", function() {
                let contentChanged = JSON.stringify({
                    type: 'onChange',
                    data: document.getElementById("editor").innerHTML });
                sendMessage(contentChanged);
            }, false);

            var applyToolbar = function(toolType, value = '') {
                switch (toolType) {
                    case 'bold':
                        document.execCommand('bold', false, '');
                        break;
                        case 'italic':
                        document.execCommand('italic', false, '');
                        break;
                        case 'underline':
                        document.execCommand('underline', false, '');
                        break;
                        case 'lineThrough':
                        document.execCommand('strikeThrough', false, '');
                        break;
                        case 'body':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                        document.execCommand('formatBlock', false, 'p');
                        break;
                        case 'title':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');

                        document.execCommand('formatBlock', false, 'h1');
                        
                        break;
                        case 'codeblock':
                            document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                            document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                            if (document.queryCommandValue('formatBlock') === 'pre') {
                                document.execCommand('formatBlock', false, 'div');
                            } else {
                              document.execCommand('formatBlock', false, 'pre');
                            }
                        break;
                        case 'blockquote':
                            document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                            document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                            
                            if (document.queryCommandValue('formatBlock') === 'blockquote') {
                                document.execCommand('formatBlock', false, 'div');
                            } else {
                              document.execCommand('formatBlock', false, 'div');
                              document.execCommand('formatBlock', false, 'blockquote');
                            }
                        break;
                        case 'heading':
                        document.queryCommandState('insertUnorderedList') && document.execCommand('insertUnorderedList');
                        document.queryCommandState('insertorderedlist') && document.execCommand('insertorderedlist');
                        document.execCommand('formatBlock', false, 'h3');
                        break;
                        case 'ol':
                        document.execCommand('formatBlock', false, 'div');
                        document.execCommand('insertorderedlist');
                        break;
                        case 'ul':
                        document.execCommand('formatBlock', false, 'div');
                        document.execCommand('insertUnorderedList');
                        break;
                        case 'color':
                        document.execCommand('foreColor', false, value);
                        break;
                        case 'highlight':
                        document.execCommand('backColor', false, value);
                        break;
                        case 'link':
                          var data = value || {};
                          var title = data.title;
                          var url = data.url || window.prompt('Enter the link URL');
                          if (url){
                            const val = "<a href='" + url + "'>" + (title || url) + "</a>";
                            doc.execCommand('insertHTML', false, val);
                          }
                          break;
                        case 'image':
                        var img = "<img src='" + value.url + "' id='" + value.id + "' width='" + Math.round(value.width) + "' height='" + Math.round(value.height) + "' alt='" + value.alt + "' />";
                         if(document.all) {
                             var range = editor.selection.createRange();
                             range.pasteHTML(img);
                             range.collapse(false);
                             range.select();
                           } else {
                             doc.execCommand("insertHTML", false, img);
                           }
                        break;
                       
                    default:
                        break;
                }
                getSelectedStyles();
                getSelectedTag();
            }

            function isChildOf(node, parentId) {
                while (node !== null) {
                    if (node.id === parentId) {
                        return true;
                    }
                    node = node.parentNode;
                }
                return false;
            };

            function createRange(node, chars) {
                var range = document.createRange()
                range.selectNode(node);
                range.setStart(node, 0);

                if (chars.count === 0) {
                    range.setEnd(node, chars.count);
                } else if (node && chars.count >0) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        if (node.textContent.length < chars.count) {
                            chars.count -= node.textContent.length;
                        } else {
                            range.setEnd(node, chars.count);
                            chars.count = 0;
                        }
                    } else {
                      for (var lp = 0; lp < node.childNodes.length; lp++) {
                            range = createRange(node.childNodes[lp], chars, range);
            
                            if (chars.count === 0) {
                                break;
                            }
                        }
                    }
                } 
                return range;
            };

            function getCursorPosition(parentId) {
                if (typeof window.getSelection === 'function') {
                    var selection = window.getSelection(),
                      charCount = -1,
                      node;
                
                    if (selection.focusNode) {
                        if (isChildOf(selection.focusNode, parentId)) {
                            node = selection.focusNode;
                            charCount = selection.focusOffset;
                    
                            while (node) {
                                if (node.id === parentId) {
                                    break;
                                }
                      
                                if (node.previousSibling) {
                                    node = node.previousSibling;
                                    charCount += node.textContent.length;
                                } else {
                                    node = node.parentNode;
                                    if (node === null) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    return charCount;
                }
                return 0;
            }            

            function setCursorPosition(el, chars) {
                if (typeof window.getSelection === 'function') {
                    if (chars >= 0) {
                        var selection = window.getSelection();
                        var range = createRange(el, { count: chars });
                        if (range) {
                            range.collapse(false);
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }
                    }
                }
            };

            function placeCaretAtEnd(el) {
              el.focus();
              if (typeof window.getSelection === 'function'
                      && typeof document.createRange != "undefined") {
                  var range = document.createRange();
                  range.selectNodeContents(el);
                  range.collapse(false);
                  var sel = window.getSelection();
                  sel.removeAllRanges();
                  sel.addRange(range);
              } else if (typeof document.body.createTextRange != "undefined") {
                  var textRange = document.body.createTextRange();
                  textRange.moveToElementText(el);
                  textRange.collapse(false);
                  textRange.select();
              }
            }

            function getCurrentSelection(el) {
                var start = 0;
                var end = 0;
                var doc = el.ownerDocument || el.document;
                var sel;
                var text;
                var link;

                if (typeof window.getSelection === 'function') {
                    sel = window.getSelection();
                    var focusNodeParentNode = sel.focusNode.parentNode;

                    text = sel.toString();
                    link = focusNodeParentNode.nodeName === 'A' ? focusNodeParentNode.toString() : '';

                    if (sel.rangeCount > 0) {
                        var range = sel.getRangeAt(0);
                        var preCaretRange = range.cloneRange();
                        preCaretRange.selectNodeContents(el);
                        preCaretRange.setEnd(range.startContainer, range.startOffset);
                        start = preCaretRange.toString().length;
                        preCaretRange.setEnd(range.endContainer, range.endOffset);
                        end = preCaretRange.toString().length;
                    }
                } else if ( (sel = doc.selection) && sel.type != 'Control') {
                    var textRange = sel.createRange();
                    var preCaretTextRange = doc.body.createTextRange();
                    preCaretTextRange.moveToElementText(el);
                    preCaretTextRange.setEndPoint('EndToStart', textRange);
                    start = preCaretTextRange.text.length;
                    preCaretTextRange.setEndPoint('EndToEnd', textRange);
                    end = preCaretTextRange.text.length;
                }

                saveSelection();
                return { start: start, end: end, text: text, link: link };
            }

            function saveSelection() {
                if (typeof window.getSelection === 'function') {
                    selectedRange = window.getSelection().getRangeAt(0);
                }
            }

            function restoreSelection() {
                if (typeof window.getSelection === 'function') {
                    var sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(selectedRange);
                }
            }

            var getRequest = function(event) {
              var msgData = JSON.parse(event.data);
              if(msgData.type === 'toolbar') {
                applyToolbar(msgData.command, msgData.value || '');
              }
              else if(msgData.type === 'editor') {
                switch (msgData.command) {
                case 'focus':
                  placeCaretAtEnd(editor);
                  break;
                case 'blur':
                  editor.blur();
                  break;
                case 'getCaretPosition':
                  sendMessage(JSON.stringify({
                    type: 'getCaretPosition',
                    data: getCursorPosition('editor')
                  }));
                  break;
                case 'setCaretPosition':
                  setCursorPosition(editor, msgData.position || 0);
                  break;
                case 'getCurrentSelection':
                  sendMessage(JSON.stringify({
                    type: 'getCurrentSelection',
                    data: getCurrentSelection(editor)
                  }));
                  break;
                case 'saveSelection':
                  saveSelection();
                  break;
                case 'restoreSelection':
                  restoreSelection();
                  break;
                case 'getHtml':
                  sendMessage(
                    JSON.stringify({
                    type: 'getHtml',
                    data: editor.innerHTML})
                    );
                  break;
                case 'setHtml':
                  editor.innerHTML = msgData.value;
                  break;
                  case 'style':
                    editor.style.cssText = msgData.value;
                    break;
                    case 'placeholder':
                      editor.setAttribute("placeholder", msgData.value);
                    break;
                default: break;
              }
            }
                 
                 
            };

            document.addEventListener("message", getRequest , false);
            window.addEventListener("message", getRequest , false);
            
        })(document)
    </script>

</body>
</html>
`;

export default editorHTML;
