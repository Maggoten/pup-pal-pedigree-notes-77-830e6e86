import React from 'react';

interface Puppy {
  name: string;
}

interface PuppyListProps {
  puppies?: Puppy[];
}

const PuppyList: React.FC<PuppyListProps> = ({ puppies }) => {
  const puppyCount = puppies?.length ?? 0;
  const safePuppies = puppies ?? [];

  return (
    <div>
      <h2>Valpar: {puppyCount}</h2>
      <ul>
        {safePuppies.map((puppy, index) => (
          <li key={index}>{puppy.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default PuppyList;
