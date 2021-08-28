export default `
  import templateA from './templateA.html';
  import templateB from './templateB.html';

  angular.module('a').component('b', {
    template: [
      'injectionA',
      'injectionB',
      (injectionA, injectionB) => {
        if (a === b) {
          return templateA
        } else {
          return templateB
        }
      },
    ]
  })
`;
