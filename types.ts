
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  appMode: 'mobile' | 'desktop' | 'producer';
}

export interface NavigationProps {
  onNavigate: (view: string, params?: any) => void;
  user?: User | null;
  params?: any;
}

export interface AgroIndustry {
  id: string;
  name: string;
  type: 'Aproscello' | 'Aliado';
  vat?: string;
  isComercioAgro?: boolean;
  warehouses: { id: string; name: string; location: string }[];
}

export interface AIDiagnosis {
  condition: string;
  confidence: number;
  severity: string;
  priority: string;
  estimatedCost: string;
  recommendation: string;
}

export enum ActivityType {
  RIEGO = 'Riego',
  FERTILIZACION = 'Fertilización',
  SIEMBRA = 'Siembra',
  FUMIGACION = 'Fumigación',
  COSECHA = 'Cosecha',
  PREPARACION = 'Preparación',
  MANTENIMIENTO = 'Mantenimiento'
}

export interface FieldActivity {
  id: string;
  date: string;
  type: ActivityType;
  producerName: string;
  farmName: string;
  fieldName: string;
  quantity: string;
  cost: number;
  status: string;
  technician: string;
}

export interface TechnicianProfile {
  id: string;
  name: string;
  role: string;
  region: string;
  email: string;
  phone: string;
  stats: {
    visitsMonth: number;
    activitiesRegistered: number;
    diagnosesPerformed: number;
    efficiency: number;
  };
}

export interface ProducerDocument {
  id: string;
  name: string;
  status: DocStatus;
  fileUrl?: string;
  rejectionReason?: string;
}

export type DocStatus = 'Pendiente' | 'Solicitado' | 'En_Revision' | 'Validado_Digital' | 'Validado_Fisico' | 'Rechazado';

export interface Producer {
  id: string;
  name: string;
  vat: string;
  type: 'Natural' | 'Juridica';
  email: string;
  phone: string;
  status: 'Activo' | 'Pendiente' | 'Inactivo';
  address?: string;
  region?: string;
  creditActive: boolean;
  filesStatus: string;
  farms: Farm[];
  source?: 'Odoo' | 'WhatsApp' | 'Mobile';
  hasSeedFields?: boolean;
  mainTechnician?: string;
  lastVisit?: string;
  nextVisit?: string;
  activeAlertsCount?: number;
  totalHectares?: number;
  activeCreditsCount: number;
  stats?: any;
  chatHistory?: ChatMessage[];
  analyticalPlanId?: string;
  crediAgro?: {
    isMember: boolean;
    score?: number;
    lastUpdate?: string;
  };
  documents?: ProducerDocument[];
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  totalArea: number;
  riceArea: number;
  coordinates?: string;
  producerId: string;
  producerName?: string;
  status: 'Activa' | 'Inactiva';
  geofenceActive: boolean;
  fields: Field[];
  state?: string;
  operationalCapacity?: number;
  lastVisit?: string;
  overOccupied?: boolean;
  activeSeedFieldsCount?: number;
  regulatory?: {
    ownershipType?: string;
    taxId?: string;
    sunagroCode?: string;
  };
  agronomics?: {
    soilType?: string;
    leveling?: string;
  };
  geofencePolygon?: any[];
}

export type FieldStatus = 'Planificado' | 'En Producción' | 'En Cosecha' | 'Cerrado';

export interface Field {
  id: string;
  farmId: string;
  farmName?: string;
  producerName?: string;
  name: string;
  code: string;
  area: number;
  crop?: string;
  use: 'Consumo' | 'Semilla';
  status: FieldStatus;
  geofenceActive: boolean;
  planCompliance?: number;
  currentStage?: string;
  alertsCount?: number;
  geofencePolygon?: any[];
}

export enum VisitType {
  PRE_CREDITO = 'Pre-Crédito',
  SEGUIMIENTO = 'Seguimiento',
  CAMPO_SEMILLA = 'Campo Semilla',
  EVALUACION_INICIAL = 'Evaluación Inicial',
  CONASEM = 'CONASEM'
}

export enum VisitStatus {
  PLANIFICADA = 'Planificada',
  CONFIRMADA = 'Confirmada',
  EN_PROCESO = 'En Proceso',
  PENDIENTE_GESTION = 'Pendiente Gestión',
  CERRADA = 'Cerrada',
  ANULADA = 'Anulada'
}

export interface VisualRecord {
  id: string;
  imageUrl: string;
  description: string;
  timestamp: string;
  aiDiagnosis?: AIDiagnosis;
}

export interface RecommendedInput {
  id: string;
  product: string;
  category: string;
  quantity: number;
  unit: string;
  source: InputSource;
  status: 'Pendiente' | 'Aprobado';
  costEstimate?: number;
}

export type InputSource = 'Aproscello' | 'Alianza' | 'Propio';

export interface Visit {
  id: string;
  code?: string;
  producerId: string;
  producerName: string;
  farmName: string;
  date: string;
  type: VisitType;
  status: VisitStatus;
  technician: string;
  observations?: string;
  visitSource?: string;
  visitMode?: string;
  authorizeDelivery?: boolean;
  authorizeLabor?: boolean;
  creditId?: string;
  terrainStatus?: string;
  aiDiagnosis?: AIDiagnosis;
  recommendedInputs?: RecommendedInput[];
  visualRecords?: VisualRecord[];
  validationResult?: 'Aprobado' | 'Rechazado';
  relatedCode?: string;
  relatedType?: 'Solicitud' | 'Apoyo' | 'Plan';
}

export enum SeedFieldStatus {
  PROPUESTO = 'Propuesto',
  APROBADO_CONASEM = 'Aprobado CONASEM',
  RECHAZADO = 'Rechazado',
  CERTIFICADO = 'Certificado',
  COSECHADO = 'Cosechado'
}

export interface SeedField {
  id: string;
  producerName: string;
  farmName: string;
  variety: string;
  category: string;
  area: number;
  cycle: string;
  status: SeedFieldStatus;
  inspectionDate?: string;
  parentLotId?: string;
  conasemRegistryId?: string;
}

export interface SeedLot {
  id: string;
  seedFieldId: string;
  variety: string;
  harvestDate: string;
  kgClean: number;
  currentCategory: string;
  status: string;
}

export interface LabAnalysis {
  id: string;
  seedLotId: string;
  date: string;
  germination: number;
  purity: number;
  moisture: number;
  status: 'Aprobado' | 'Rechazado';
  type: 'Interno' | 'Oficial';
}

export type CreditApplicationStatus = 
  | 'Solicitud' 
  | 'Pre-Aprobada' 
  | 'Documentacion' 
  | 'Visita_Evaluacion' 
  | 'Comite' 
  | 'Inspeccion_Conasem' 
  | 'Contrato' 
  | 'Activa' 
  | 'Rechazada';

export interface CommitteeDossier {
  generatedDate: string;
  producerBio: string;
  financialSummary: string;
  technicalOpinion: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
}

export interface CreditApplication {
  id: string;
  code: string;
  producerName: string;
  farmName: string;
  type: 'Consumo' | 'Semilla';
  projectType: string;
  amount: number;
  requestedAmount?: number;
  hectares: number;
  status: CreditApplicationStatus;
  date: string;
  patternId?: string;
  patternName?: string;
  supportTypeId?: string;
  documents: any[];
  assignedTechnician?: string;
  assignedTechnicianId?: string;
  visitCode?: string;
  visitId?: string;
  dossier?: CommitteeDossier;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  image?: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface SupportPattern {
  id: string;
  name: string;
  cycle: string;
  cropIds: string[];
  cropName?: string;
  projectType: 'Consumo' | 'Semilla';
  adminFeePercent: number;
  status: PatternStatus;
  financingCap: number;
  globalBudget: number;
  lines: SupportPatternLine[];
  stages: SupportPatternStage[];
  associatedPartners: { partnerId: string, stageId?: string }[];
  committeeIds: string[];
  requiredDocumentIds: string[];
  subTypes: SupportPatternSubType[];
  validityStart?: string;
  validityEnd?: string;
  plannedVisitsCount?: number;
}

export type PatternStatus = 'Inicio' | 'Planificacion' | 'Activo' | 'Cierre';

export interface SupportPatternStage {
  id: string;
  masterStageId?: string;
  name: string;
  order: number;
  deadlineDays: number;
  requiresVisit: boolean;
  visitCount?: number;
  visitFrequency?: string;
}

export interface SupportPatternLine {
  id: string;
  product: string;
  inputId?: string;
  category: string;
  standardQty: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  type: string;
}

export interface SupportPatternSubType {
  id: string;
  name: string;
  description: string;
  includedLineIds: string[];
  calculatedCostPerHa: number;
}

export interface Credit {
  id: string;
  producerName: string;
  farmName: string;
  projectType: 'Consumo' | 'Semilla';
  supportType?: string;
  amountApproved: number;
  amountConsumed: number;
  amountAvailable: number;
  status: 'Activo' | 'Firma Pendiente' | 'Liquidado';
  cycle: string;
  disbursements?: any[];
  totalDisbursed: number;
  totalDelivered: number;
}

export interface Harvest {
  id: string;
  producerName: string;
  farmName: string;
  creditId: string;
  crop: string;
  kgHarvested: number;
  unitPrice: number;
  totalAmount: number;
  status: 'Registrado' | 'Pagado';
  date: string;
  projectType: string;
  cycle: string;
  paymentStatus: 'Total' | 'Parcial' | 'Pendiente';
  harvestedArea?: number;
  yield?: number;
  loads?: HarvestLoad[];
  grossAmount?: number;
  retentionPercent?: number;
  retentionAmount?: number;
  seedCategory?: string;
  linkedVisits?: string[];
}

export interface HarvestLoad {
  id: string;
  harvestId: string;
  date: string;
  kg: number;
  guideNumber: string;
  moisture: number;
  impurity: number;
  status: string;
  destination?: string;
}

export interface RoutePlan {
  id: string;
  startDate: string;
  endDate: string;
  technicianId: string;
  status: 'Activo' | 'Borrador' | 'Finalizado';
  days: RouteDay[];
}

export interface RouteDay {
  id: string;
  date: string;
  dayLabel?: string;
  status: 'Borrador' | 'Confirmada' | 'En Curso' | 'Finalizada';
  technicianId: string;
  totalKm: number;
  stops: RouteStop[];
}

export interface RouteStop {
  id: string;
  visitId?: string;
  visitCode?: string;
  sequence: number;
  farmName: string;
  producerName: string;
  fieldId: string;
  fieldName: string;
  lat: number;
  lng: number;
  priorityLevel: 'Alta' | 'Media' | 'Baja';
  status: 'Pendiente' | 'En Sitio' | 'Completada';
  estimatedTime: string;
  reason: string;
  activityType?: ActivityType;
  isSeedField?: boolean;
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  type: 'Consumo' | 'Semilla';
  cycleDurationDays: number;
  status: 'Activo' | 'Inactivo';
}

export interface InputProduct {
  id: string;
  name: string;
  category: string;
  activeIngredient?: string;
  presentation: string;
  unit: string;
  price?: number;
  stockLevel: number;
  warehouseId?: string;
  status: 'Activo' | 'Inactivo';
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  zone: string;
  active: boolean;
  vehicleInfo?: string;
  coverageRadius: number;
  assignedFarmIds: string[];
  role: 'Jefe' | 'Tecnico';
  odooUser?: string;
  supervisorId?: string;
  subordinateIds?: string[];
}

export interface MasterStage {
  id: string;
  name: string;
  description: string;
  defaultDuration: number;
  requiresVisit: boolean;
  status: 'Activo' | 'Inactivo';
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  agroIndustry: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  requiredFor: 'Natural' | 'Juridica' | 'Ambos';
  stage: 'Solicitud' | 'Contrato' | 'Cierre';
}

export interface CropPlan {
  id: string;
  name: string;
  lotId: string;
  farmName: string;
  producerName: string;
  cycle: string;
  type: string;
  hectares: number;
  tasks: PlannedTask[];
}

export interface PlannedTask {
  id: string;
  activityType: ActivityType;
  dayRelative: number;
  duration: number;
  status: 'Ejecutada' | 'Autorizada' | 'Planificada' | 'Vencida';
}

export interface Delivery {
  id: string;
  code: string;
  dateScheduled: string;
  producerId: string;
  producerName: string;
  farmId: string;
  farmName: string;
  creditId: string;
  projectType: 'Consumo' | 'Semilla';
  originType: DeliveryOriginType;
  originId?: string;
  providerType: DeliveryProviderType;
  providerName: string;
  status: DeliveryStatus;
  totalAmount: number;
  items: DeliveryItem[];
  logistics?: {
    warehouseId: string;
    transportType: string;
  };
  invoice?: {
    number: string;
    date: string;
    amount: number;
    status: string;
  };
}

export type DeliveryStatus = 'Borrador' | 'Autorizada' | 'Pendiente' | 'En Tránsito' | 'Entregada' | 'Facturada' | 'Cancelada';
export type DeliveryProviderType = 'Aproscello' | 'Alianza';
export type DeliveryOriginType = 'Visita' | 'Manual';

export interface DeliveryItem {
  id: string;
  product: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  origin: InputSource;
  category: string;
  isSeed: boolean;
  seedCategory?: string;
  visitRecommendationId?: string;
}

export interface VisitSpecificData {
  soilTexture?: string;
  waterSource?: string;
  machineryAvailable?: boolean;
}

export interface InitialEvalData extends VisitSpecificData {
  landTenureStatus: string;
  previousCrop: string;
}

export interface SeedInspectionData {
  isolationDistanceMet: boolean;
  offTypesFound: number;
  geneticPurityEst: number;
  floweringPercentage: number;
  estimatedYieldKg: number;
}

export interface FollowUpData {
  phenologicalStage: string;
  pestPresence: string;
  weedControlStatus: string;
  plantHeightCm: number;
}
