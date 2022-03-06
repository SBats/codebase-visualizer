export default `
import htmlFile from './template.html';

const a = {
  template: htmlFile,
}
const b = {
  template: '<div>INLINE_STRING_TEMPLATE</div>',
}
const c = {
  template: \`
    <div>TEMPLATE_STRING_TEMPLATE</div>
  \`,
}
const d = {
  template: \`
    <div>\${TEMPLATE_STRING_INTERPOLATION_TEMPLATE}</div>
  \`,
}
`;
