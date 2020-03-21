import React from 'react';

export const getAttributions = (attributionMap) => {
  const icSort = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

  const sortedNames = Object.keys(attributionMap).sort(icSort);
  let attributions = [];

  sortedNames.forEach(name => {
    attributions.push(
      <div key={name} style={{ paddingTop: '10px', textAlignment: 'center' }}>
        <p>
          <a href={attributionMap[name].repository}>{name}</a><br/>
          {attributionMap[name].license}
        </p>
        <hr style={{ width: '50%' }}/>
      </div>,
    );
  });
  return attributions;
};

