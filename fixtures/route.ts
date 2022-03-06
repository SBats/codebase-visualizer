export default `
import importedTemplate from './import.html'

const Routes = ($stateProvider) => {
  $stateProvider.state('inlineString', {
    url: '/inlineString',
    template: '<div>INLINE_STRING_TEMPLATE</div>',
  })
  $stateProvider.state('inlineTemplateString', {
    url: '/inlineTemplateString',
    template: \`
      <div>
        INLINE_TEMPLATE_STRING_TEMPLATE
      </div>
    \`,
  })
  $stateProvider.state('inlineTemplateSubstitutionString', {
    url: '/inlineTemplateSubstitutionString',
    template: \`
      <div>
        \${INLINE_TEMPLATE_SUBSTITUTION_STRING_TEMPLATE}
      </div>
    \`,
  })
  $stateProvider.state('import', {
    url: '/import',
    views: {
      '@app': {
        template: importedTemplate,
      },
    },
  }),
  $stateProvider.state('views', {
    url: '/views',
    views: {
      '@content': {
        template: '<div>CONTENT_TEMPLATE</div>',
      },
      '@sidebar': {
        template: '<div>SIDEBAR_TEMPLATE</div>',
      },
    },
  })
}

Routes.$inject = ['$stateProvider']

angular.module('a').config(Routes)

`;
