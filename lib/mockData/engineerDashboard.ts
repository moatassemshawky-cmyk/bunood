/**
 * Mock data for the Engineer Dashboard (BOQ management). Shapes are designed to map
 * 1:1 onto future Neon tables — swapping this module for real queries later shouldn't
 * require touching the components that consume it.
 */

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'planning' | 'completed';
  createdAt: string;
}

export interface BreakdownMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  estimatedCost: number;
  availability: 'available' | 'limited' | 'unavailable';
}

export interface BoqNode {
  id: string;
  name: string;
  /** Category bands nest further nodes. */
  children?: BoqNode[];
  /** Leaf items expand into a materials breakdown. */
  breakdown?: BreakdownMaterial[];
}

export interface Boq {
  id: string;
  projectId: string;
  name: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  progress: number;
  itemCount: number;
  totalCost: number;
  lastUpdated: string;
  createdAt: string;
  tree: BoqNode[];
}

export interface Supplier {
  id: string;
  name: string;
  categories: string[];
  rating: number;
}

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'Residential Tower', location: 'New Cairo, Egypt', status: 'active', createdAt: '2026-05-12' },
  { id: 'proj-2', name: 'Warehouse Expansion', location: 'Sadat City, Egypt', status: 'planning', createdAt: '2026-06-02' },
];

function mat(
  id: string, name: string, unit: string, quantity: number, estimatedCost: number,
  availability: BreakdownMaterial['availability'] = 'available',
): BreakdownMaterial {
  return { id, name, unit, quantity, estimatedCost, availability };
}

const REINFORCED_CONCRETE_BREAKDOWN: BreakdownMaterial[] = [
  mat('m-rc-1', 'Cement',        'ton', 12, 18000),
  mat('m-rc-2', 'Sand',          'm³',  20, 6500),
  mat('m-rc-3', 'Gravel',        'm³',  18, 7200, 'limited'),
  mat('m-rc-4', 'Steel Rebar',   'ton', 8,  62000),
  mat('m-rc-5', 'Water',         'm³',  6,  300),
  mat('m-rc-6', 'Formwork',      'm²',  140, 9800),
  mat('m-rc-7', 'Labor',         'day', 25, 12500),
  mat('m-rc-8', 'Concrete Pump', 'shift', 4, 8800, 'unavailable'),
];

const EXCAVATION_BREAKDOWN: BreakdownMaterial[] = [
  mat('m-ex-1', 'Labor',       'day',   10, 5000),
  mat('m-ex-2', 'Equipment',   'shift', 6,  9600),
  mat('m-ex-3', 'Disposal',    'trip',  8,  4000),
];

const PLAIN_CONCRETE_BREAKDOWN: BreakdownMaterial[] = [
  mat('m-pc-1', 'Cement', 'ton', 6,  9000),
  mat('m-pc-2', 'Sand',   'm³',  10, 3250),
  mat('m-pc-3', 'Gravel', 'm³',  9,  3600),
  mat('m-pc-4', 'Water',  'm³',  3,  150),
  mat('m-pc-5', 'Labor',  'day', 8,  4000, 'limited'),
];

const COLUMNS_BREAKDOWN: BreakdownMaterial[] = [
  mat('m-col-1', 'Steel Rebar',  'ton', 5,  38750),
  mat('m-col-2', 'Concrete Mix', 'm³',  22, 15400),
  mat('m-col-3', 'Formwork',     'm²',  60, 4200),
  mat('m-col-4', 'Labor',        'day', 14, 7000),
];

export const MOCK_BOQS: Boq[] = [
  {
    id: 'boq-1',
    projectId: 'proj-1',
    name: 'Concrete Works',
    status: 'in-progress',
    progress: 62,
    itemCount: 4,
    totalCost: 231650,
    lastUpdated: '2026-06-28',
    createdAt: '2026-05-14',
    tree: [
      {
        id: 'band-concrete',
        name: 'Concrete Works',
        children: [
          { id: 'item-excavation', name: 'Excavation', breakdown: EXCAVATION_BREAKDOWN },
          { id: 'item-plain-concrete', name: 'Plain Concrete', breakdown: PLAIN_CONCRETE_BREAKDOWN },
          { id: 'item-reinforced-concrete', name: 'Reinforced Concrete', breakdown: REINFORCED_CONCRETE_BREAKDOWN },
          { id: 'item-columns', name: 'Columns', breakdown: COLUMNS_BREAKDOWN },
        ],
      },
    ],
  },
  {
    id: 'boq-2',
    projectId: 'proj-2',
    name: 'Site Preparation',
    status: 'draft',
    progress: 8,
    itemCount: 1,
    totalCost: 42000,
    lastUpdated: '2026-06-20',
    createdAt: '2026-06-10',
    tree: [
      {
        id: 'band-earthworks',
        name: 'Earthworks',
        children: [
          { id: 'item-clearing', name: 'Site Clearing', breakdown: EXCAVATION_BREAKDOWN },
        ],
      },
    ],
  },
];

export interface RfqRecord {
  id: string;
  reference: string;
  boqName: string;
  materialCount: number;
  status: 'sent' | 'quoted' | 'awarded';
  sentAt: string;
}

export const MOCK_RFQS: RfqRecord[] = [
  { id: 'rfq-1', reference: 'RFQ-2026-0142', boqName: 'Concrete Works', materialCount: 4, status: 'quoted', sentAt: '2026-06-24' },
  { id: 'rfq-2', reference: 'RFQ-2026-0138', boqName: 'Concrete Works', materialCount: 2, status: 'awarded', sentAt: '2026-06-18' },
  { id: 'rfq-3', reference: 'RFQ-2026-0129', boqName: 'Site Preparation', materialCount: 3, status: 'sent', sentAt: '2026-06-12' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'Delta Steel Co.',            categories: ['Steel', 'Rebar'],            rating: 4.6 },
  { id: 'sup-2', name: 'Al-Masry Concrete',          categories: ['Ready Mix', 'Cement'],        rating: 4.9 },
  { id: 'sup-3', name: 'Nile Aggregates',            categories: ['Sand', 'Gravel'],             rating: 4.3 },
  { id: 'sup-4', name: 'Cairo Formwork Systems',     categories: ['Formwork', 'Equipment'],      rating: 4.1 },
  { id: 'sup-5', name: 'Advanced Building Co.',      categories: ['Labor', 'General Contracting'], rating: 4.7 },
];
