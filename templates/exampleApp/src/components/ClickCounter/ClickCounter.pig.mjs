import coords from "/modules/imagesCoords.pig";

const { updatePigsCounter, pigs } = $attrs;
$B.firstRender = $$(true);

$onBeforeUpdate(() => {
  this.clearListeners();
});

for (const pig of pigs) {
  const pigElement = $element(`#${pig}`);
  if ($B.firstRender) {
    const coordsData = coords[pig];
    pigElement.setAttribute("coords", coordsData.toString());
  }
  pigElement.on("click", () => updatePigsCounter(pig));
}
