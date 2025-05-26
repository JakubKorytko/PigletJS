const pigs = [...$element("tbody tr").children].map((el) => el.id);

$$P.pigsCounter = $$(
  pigs.reduce((acc, pig) => {
    acc[pig] = {
      isEven: true,
      _count: 0,
      set count(val) {
        this._count = val;
        this.isEven = val % 2 === 0;
      },
      get count() {
        return this._count;
      },
    };
    return acc;
  }, {}),
  true,
);

$B.arePigsEven = Object.values($$P.pigsCounter).every((pig) => pig.isEven);

for (const pigName of pigs) {
  $element(`#${pigName}`).innerText = $$P.pigsCounter[pigName].count;
}

$element("ClickCounter").pass({
  updatePigsCounter: (pigName) => $$P.pigsCounter[pigName].count++,
  pigs,
});
