export const resetBoard = () => {
  const selectedElements = document.querySelectorAll('.active [data-selected="true"]');
  selectedElements.forEach(elm => {
    elm.setAttribute('data-selected', 'false');
  })
}