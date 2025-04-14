import React, { useState } from 'react';
import Image from '@/components/ui/Image';
import { Button } from '../ui/button';
import { uploadAPI } from '../../lib/api';
import { toast } from 'sonner';

const RecipeImage = ({ recipe }) => {
  return (
    <div className="h-12 w-12 rounded-md overflow-hidden">
      <Image
        src={recipe.image}
        alt={recipe.title}
        className="h-full w-full"
        width="48px"
        height="48px"
        objectFit="cover"
        lazy={true}
      />
    </div>
  );
};

export default RecipeImage; 