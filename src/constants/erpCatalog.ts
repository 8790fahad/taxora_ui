export type ErpStatus = 'available' | 'beta' | 'coming_soon';

export type ErpIntegration = {
  id: string;
  name: string;
  description: string;
  status: ErpStatus;
  authMethod?: string;
  connectorType: string;
};

export type ErpCatalogGroup = {
  id: string;
  title: string;
  description: string;
  integrations: ErpIntegration[];
};

/** ERP connector catalog — grouped by market segment, sorted by demand within each group. */
export const ERP_CATALOG: ErpCatalogGroup[] = [
  {
    id: 'accounting_software',
    title: 'Accounting Software',
    description: 'Cloud accounting and bookkeeping platforms.',
    integrations: [
      {
        id: 'quickbooks',
        connectorType: 'quickbooks',
        name: 'QuickBooks Online',
        description: 'Connect via Intuit OAuth',
        authMethod: 'oauth2',
        status: 'available',
      },
      {
        id: 'zoho',
        connectorType: 'zoho',
        name: 'Zoho Books',
        description: 'Connect via Zoho OAuth',
        authMethod: 'oauth2',
        status: 'available',
      },
      {
        id: 'flowbooks',
        connectorType: 'flowbooks',
        name: 'FlowBooks',
        description: 'Connect via OAuth (FlowBooks REST)',
        authMethod: 'oauth2',
        status: 'beta',
      },
      {
        id: 'sage_intacct',
        connectorType: 'sage',
        name: 'Sage Intacct',
        description: 'Connect via OAuth (Intacct REST)',
        authMethod: 'oauth2',
        status: 'beta',
      },
      {
        id: 'xero',
        connectorType: 'xero',
        name: 'Xero',
        description: 'Cloud accounting (OAuth 2.0 API)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'tally',
        connectorType: 'tally',
        name: 'TallyPrime',
        description: 'Connect via local/network XML',
        authMethod: 'xml_http',
        status: 'available',
      },
    ],
  },
  {
    id: 'sme_erp',
    title: 'SME ERP',
    description: 'All-in-one ERP and inventory for small businesses.',
    integrations: [
      {
        id: 'odoo',
        connectorType: 'odoo',
        name: 'Odoo',
        description: 'Connect via API key (JSON-RPC)',
        authMethod: 'api_key',
        status: 'available',
      },
      {
        id: 'erpnext',
        connectorType: 'erpnext',
        name: 'ERPNext',
        description: 'Open-source ERP (REST API)',
        authMethod: 'api_key',
        status: 'coming_soon',
      },
      {
        id: 'sap_business_one',
        connectorType: 'sapb1',
        name: 'SAP Business One',
        description: 'SAP ERP for SMEs (Service Layer)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'katana',
        connectorType: 'katana',
        name: 'Katana Cloud Manufacturing',
        description: 'Manufacturing & inventory (REST API)',
        authMethod: 'api_key',
        status: 'coming_soon',
      },
      {
        id: 'mrpeasy',
        connectorType: 'mrpeasy',
        name: 'MRPeasy',
        description: 'Cloud manufacturing / MRP (REST API)',
        authMethod: 'api_key',
        status: 'coming_soon',
      },
      {
        id: 'fishbowl',
        connectorType: 'fishbowl',
        name: 'Fishbowl Inventory',
        description: 'Inventory & manufacturing',
        authMethod: 'api_key',
        status: 'coming_soon',
      },
    ],
  },
  {
    id: 'mid_market_erp',
    title: 'Mid-Market ERP',
    description: 'Scalable ERP for growing, multi-entity operations.',
    integrations: [
      {
        id: 'dynamics365_business_central',
        connectorType: 'dynamics365bc',
        name: 'Dynamics 365 Business Central',
        description: 'Microsoft mid-market ERP (OData/API)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'acumatica',
        connectorType: 'acumatica',
        name: 'Acumatica Cloud ERP',
        description: 'Cloud ERP (REST/contract API)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'sage_200_evolution',
        connectorType: 'sage200',
        name: 'Sage 200 Evolution',
        description: 'Sage mid-market ERP',
        authMethod: 'api_key',
        status: 'coming_soon',
      },
      {
        id: 'syspro',
        connectorType: 'syspro',
        name: 'SYSPRO',
        description: 'Manufacturing & distribution ERP',
        authMethod: 'api_key',
        status: 'coming_soon',
      },
      {
        id: 'epicor_kinetic',
        connectorType: 'epicor',
        name: 'Epicor Kinetic',
        description: 'Manufacturing ERP (REST API)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
    ],
  },
  {
    id: 'enterprise_erp',
    title: 'Enterprise ERP',
    description: 'Large-scale suites for complex global operations.',
    integrations: [
      {
        id: 'sap_s4hana',
        connectorType: 'saps4hana',
        name: 'SAP S/4HANA',
        description: 'SAP enterprise suite (OData)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'oracle_netsuite',
        connectorType: 'netsuite',
        name: 'Oracle NetSuite',
        description: 'Cloud ERP (SuiteTalk REST)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'dynamics365_fscm',
        connectorType: 'dynamics365',
        name: 'Dynamics 365 Finance & Supply Chain Management',
        description: 'Microsoft enterprise ERP',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'oracle_fusion_cloud_erp',
        connectorType: 'oraclefusion',
        name: 'Oracle Fusion Cloud ERP',
        description: 'Oracle Cloud ERP (REST API)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'infor_cloudsuite',
        connectorType: 'infor',
        name: 'Infor CloudSuite',
        description: 'Industry cloud ERP (ION API)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
      {
        id: 'ifs_cloud',
        connectorType: 'ifs',
        name: 'IFS Cloud',
        description: 'Enterprise ERP/EAM (REST API)',
        authMethod: 'oauth2',
        status: 'coming_soon',
      },
    ],
  },
];

/** Flat lookup: connectorType → official product name (for labels, sync buttons, etc.). */
export const ERP_LABELS: Record<string, string> = Object.fromEntries(
  ERP_CATALOG.flatMap((g) =>
    g.integrations.map((i) => [i.connectorType, i.name] as const),
  ),
);

/** Whether a connector can be connected right now. */
export function isErpConnectable(status: ErpStatus): boolean {
  return status === 'available' || status === 'beta';
}
