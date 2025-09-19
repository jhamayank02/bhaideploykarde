export interface IntrospectedSchema {
  build_logs: {
    'project_id': 'String';
    'build_id': 'String';
    'level': 'LowCardinality(String)';
    'timestamp': 'DateTime64(3, \'UTC\')';
    'log_message': 'String';
    'service': 'String';
    'status': 'String';
  };
}

// Type-safe record types for each table
export interface Build_logsRecord {
  'project_id': string;
  'build_id': string;
  'level': string;
  'timestamp': string;
  'log_message': string;
  'service': string;
  'status': string;
}