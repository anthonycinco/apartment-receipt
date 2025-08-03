-- Create sites table
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  total_units INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  door_number VARCHAR(50) NOT NULL,
  phone VARCHAR(50),
  base_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_records table
CREATE TABLE billing_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  electricity_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  water_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  electricity_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  water_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  base_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
  parking_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  other_charges DECIMAL(10,2) NOT NULL DEFAULT 0,
  damage_description TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tenants_site_id ON tenants(site_id);
CREATE INDEX idx_billing_records_site_id ON billing_records(site_id);
CREATE INDEX idx_billing_records_tenant_id ON billing_records(tenant_id);
CREATE INDEX idx_billing_records_date ON billing_records(date);

-- Insert sample data (optional)
INSERT INTO sites (name, address, total_units) VALUES
  ('Laguna', 'Laguna Site Address', 50),
  ('Pidanna', 'Pidanna Site Address', 30);

INSERT INTO tenants (name, site_id, door_number, phone, base_rent) VALUES
  ('John Doe', (SELECT id FROM sites WHERE name = 'Laguna'), 'A101', '+1234567890', 5000),
  ('Jane Smith', (SELECT id FROM sites WHERE name = 'Pidanna'), 'B201', '+0987654321', 4500); 