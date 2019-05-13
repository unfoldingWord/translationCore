

const entries = [
  {id: "god", title: "God"},
  {id: "godly", title: "godly, godliness, ungodly, godless, ungodliness, godlessness"},
  {id: "godthefather", title: "God the Father, heavenly Father, Father"}
];

test("sort", () => {
  const sorted = entries.reverse().sort((a, b) => {
    const aName = (a.title || a.id).toLowerCase();
    const bName = (b.title || b.id).toLowerCase();
    return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
  });
  console.log("sorted=" + JSON.stringify(sorted, null, 2));
});
