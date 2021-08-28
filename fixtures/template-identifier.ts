export default `
  import templateA from './templateA.html';

  angular.module('a').component('b', {
    template: templateA
  })
`;
