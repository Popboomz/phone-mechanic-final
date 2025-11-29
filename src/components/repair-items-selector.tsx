
"use client";

import * as React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFullLabelPathForRepairItem } from '@/lib/data';

interface RepairItemNode {
  id: string;
  label: string;
  children?: RepairItemNode[];
}

const repairData: RepairItemNode[] = [
  {
    id: 'none',
    label: 'None',
  },
  {
    id: 'screen_repair',
    label: 'Screen Repair',
    children: [
      {
        id: 'aftermaket_incell',
        label: 'aftermaket incell',
        children: [
          { id: 'incell_80_90hz', label: '80-90hz' },
          { id: 'incell_120hz', label: '120hz' },
          { id: 'standard_aftermaket_incell', label: 'standard aftermaket' },
        ],
      },
      {
        id: 'aftermaket_hard',
        label: 'aftermaket hard',
        children: [
          { id: 'hard_80_90hz', label: '80-90hz' },
          { id: 'hard_120hz', label: '120hz' },
          { id: 'standard_aftermaket_hard', label: 'standard aftermaket' },
        ],
      },
      { id: 'aftermaket_soft_120hz', label: 'aftermaket soft 120hz' },
      { id: 'service_pack', label: 'service pack' },
      { id: 'oem', label: 'oem' },
    ],
  },
  {
    id: 'accessory_repair',
    label: 'Accessory Repair',
    children: [
      {
        id: 'camera',
        label: 'camera',
        children: [
          { id: 'front_camera', label: 'front' },
          { id: 'rear_camera', label: 'rear' },
        ],
      },
      { 
        id: 'charging_port', 
        label: 'charging port',
        children: [
            { id: 'microphone', label: 'microphone' },
            { id: 'barometer', label: 'barometer' },
        ]
      },
      {
        id: 'sensor',
        label: 'sensor',
        children: [
          { id: 'wifi', label: 'wifi' },
          { id: 'bluetooth', label: 'bluetooth' },
          { id: 'light', label: 'light' },
        ],
      },
      {
        id: 'battery',
        label: 'battery',
        children: [
          { id: 'aftermaket_battery', label: 'aftermaket' },
          { id: 'sp_battery', label: 'sp' },
        ],
      },
      {
        id: 'glass',
        label: 'glass',
        children: [
          { id: 'back_glass', label: 'back' },
          { id: 'camera_glass', label: 'camera' },
        ],
      },
      {
        id: 'speaker',
        label: 'speaker',
        children: [
            { id: 'loud_speaker', label: 'loud' },
            { id: 'front_speaker', label: 'front' },
        ]
      }
    ],
  },
];

interface RepairItemsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const RepairItemsSelector: React.FC<RepairItemsSelectorProps> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);

  const addItem = (itemId: string) => {
    if (value.includes(itemId)) return;
    onChange([...value, itemId]);
    setOpen(false);
  };

  const removeItem = (itemId: string) => {
    onChange(value.filter((id) => id !== itemId));
  };

  const renderTree = (nodes: RepairItemNode[]) => {
    return nodes.map((node) => {
      if (!node.children || node.children.length === 0) {
        return (
          <div key={node.id} className="pl-4">
             <Button
                variant="ghost"
                className="w-full justify-start font-normal"
                onClick={() => addItem(node.id)}
             >
                {node.label}
             </Button>
          </div>
        );
      }

      return (
        <Collapsible key={node.id} className="pl-4">
            <CollapsibleTrigger asChild>
                <div className="flex items-center space-x-2 py-1 w-full font-medium text-sm hover:bg-accent hover:text-accent-foreground rounded-md px-2">
                    <span>{node.label}</span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
            </CollapsibleTrigger>
          <CollapsibleContent className="pl-2 border-l border-dashed ml-2">
            {renderTree(node.children)}
          </CollapsibleContent>
        </Collapsible>
      );
    });
  };


  return (
    <div className="space-y-2">
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 font-normal"
        >
          <span className='truncate'>Select repair items...</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <ScrollArea className="h-72">
          <div className="p-2">
            {renderTree(repairData)}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
    
    {React.createElement(
      'div',
      { className: 'mt-2 flex flex-wrap gap-2' },
      value.map((id) => {
        const label = id.startsWith('custom:') ? id.slice(7) : getFullLabelPathForRepairItem(id);
        return React.createElement(
          Button,
          { key: id, variant: 'secondary', className: 'h-6 px-2 py-0 text-xs' },
          label,
          React.createElement(
            'span',
            {
              className: 'ml-2 cursor-pointer',
              onClick: (e) => {
                e.stopPropagation();
                removeItem(id);
              },
            },
            '✖'
          )
        );
      })
    )}
    </div>
  );
};
