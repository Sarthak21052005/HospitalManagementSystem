-- For plain text passwords, replace the hashed passwords with:
INSERT INTO Doctor (email, password, name, specialization, contact) VALUES
('anjali.sharma@hospital.com', '123456', 'Dr. Anjali Sharma', 'General Medicine', '9876543210'),
('rajesh.kumar@hospital.com', '123456', 'Dr. Rajesh Kumar', 'Cardiology', '9876543211'),
('priya.patel@hospital.com', '123456', 'Dr. Priya Patel', 'Pediatrics', '9876543212');

INSERT INTO Nurse (email, password, name, contact) VALUES
('priya.verma@hospital.com', '123456', 'Priya Verma', '9876543213'),
('amit.singh@hospital.com', '123456', 'Amit Singh', '9876543214'),
('kavita.reddy@hospital.com', '123456', 'Kavita Reddy', '9876543215');

INSERT INTO Lab_Technician (name, email, password, phone, specialization) VALUES
('Suresh Rao', 'suresh.rao@hospital.com', '123456', '9876543216', 'Clinical Pathology');

INSERT INTO Medical_Inventory (
    item_name, item_category, item_type, description, manufacturer,
    unit_of_measure, quantity_in_stock, reorder_level, unit_price,
    expiry_date, batch_number, storage_location
) VALUES
-- Medicines
('Paracetamol 500mg', 'Medicine', 'Tablet', 'Pain relief and fever reducer', 'PharmaCorp', 'Tablets', 500, 100, 2.50, '2026-12-31', 'PARA-2024-001', 'Pharmacy A-1'),
('Amoxicillin 250mg', 'Medicine', 'Capsule', 'Antibiotic for bacterial infections', 'MediLife', 'Capsules', 300, 50, 15.00, '2026-08-15', 'AMOX-2024-002', 'Pharmacy A-2'),
('Ibuprofen 400mg', 'Medicine', 'Tablet', 'Anti-inflammatory pain reliever', 'HealthPlus', 'Tablets', 400, 80, 5.00, '2026-10-20', 'IBU-2024-003', 'Pharmacy A-1'),
('Cetirizine 10mg', 'Medicine', 'Tablet', 'Antihistamine for allergies', 'AllerCare', 'Tablets', 250, 50, 3.50, '2026-09-30', 'CETI-2024-004', 'Pharmacy A-3'),
('Metformin 500mg', 'Medicine', 'Tablet', 'Diabetes management', 'DiabetoCare', 'Tablets', 350, 70, 8.00, '2026-11-15', 'MET-2024-005', 'Pharmacy B-1'),
('Omeprazole 20mg', 'Medicine', 'Capsule', 'Acid reflux treatment', 'GastroMed', 'Capsules', 200, 40, 12.00, '2026-07-25', 'OMEP-2024-006', 'Pharmacy B-2'),
('Aspirin 75mg', 'Medicine', 'Tablet', 'Blood thinner for heart health', 'CardioHealth', 'Tablets', 450, 90, 4.00, '2027-01-10', 'ASP-2024-007', 'Pharmacy A-1'),
('Dextromethorphan Syrup', 'Medicine', 'Syrup', 'Cough suppressant', 'CoughCure', 'Bottles (100ml)', 80, 20, 25.00, '2026-06-30', 'DEX-2024-008', 'Pharmacy C-1'),
('Ciprofloxacin 500mg', 'Medicine', 'Tablet', 'Broad-spectrum antibiotic', 'AntiBioTech', 'Tablets', 180, 40, 20.00, '2026-09-15', 'CIPRO-2024-009', 'Pharmacy A-2'),
('Insulin Glargine', 'Injection', 'Injection', 'Long-acting insulin for diabetes', 'InsulinCare', 'Vials (10ml)', 60, 15, 450.00, '2026-05-20', 'INS-2024-010', 'Refrigerated Storage'),

-- Injections
('Normal Saline 0.9%', 'Injection', 'IV Fluid', 'Intravenous fluid for hydration', 'FluidTech', 'Bags (500ml)', 200, 50, 35.00, '2027-03-01', 'SAL-2024-011', 'IV Room'),
('Dextrose 5%', 'Injection', 'IV Fluid', 'Glucose solution for energy', 'GlucoMed', 'Bags (500ml)', 150, 40, 40.00, '2027-02-15', 'DEX-2024-012', 'IV Room'),
('Adrenaline 1mg/ml', 'Injection', 'Emergency Drug', 'Emergency cardiac stimulant', 'EmergCare', 'Ampoules (1ml)', 100, 25, 120.00, '2026-12-01', 'ADR-2024-013', 'Emergency Storage'),
('Morphine 10mg/ml', 'Injection', 'Pain Relief', 'Strong pain reliever', 'PainAway', 'Ampoules (1ml)', 50, 15, 250.00, '2026-11-10', 'MOR-2024-014', 'Controlled Substances'),

-- Surgical Equipment
('Surgical Gloves (Latex)', 'Surgical Equipment', 'Protective Gear', 'Sterile surgical gloves', 'SurgicalPro', 'Pairs', 1000, 200, 8.00, NULL, 'GLOVE-2024-015', 'Surgery Storage A'),
('Surgical Mask (N95)', 'PPE', 'Protective Gear', 'High-filtration face mask', 'SafeMed', 'Pieces', 800, 150, 15.00, NULL, 'MASK-2024-016', 'PPE Storage'),
('Scalpel Blade #10', 'Surgical Equipment', 'Cutting Tool', 'Sterile surgical blade', 'SharpEdge', 'Pieces', 300, 60, 5.50, NULL, 'SCAL-2024-017', 'Surgery Storage B'),
('Surgical Suture (3-0)', 'Surgical Equipment', 'Suture', 'Absorbable surgical thread', 'SutureTech', 'Packets', 250, 50, 35.00, NULL, 'SUT-2024-018', 'Surgery Storage C'),
('Sterile Gauze Pads', 'Consumables', 'Dressing', 'Sterile wound dressing', 'DressCare', 'Packets (10 pcs)', 500, 100, 12.00, NULL, 'GAUZE-2024-019', 'Dressing Room'),

-- Diagnostic Equipment
('Digital Thermometer', 'Diagnostic Equipment', 'Temperature Monitor', 'Non-contact infrared thermometer', 'TempPro', 'Units', 50, 10, 250.00, NULL, 'THERM-2024-020', 'Ward Equipment'),
('Blood Pressure Monitor', 'Diagnostic Equipment', 'BP Monitor', 'Automatic BP measurement device', 'BPCare', 'Units', 30, 8, 1200.00, NULL, 'BP-2024-021', 'Ward Equipment'),
('Pulse Oximeter', 'Diagnostic Equipment', 'Oxygen Monitor', 'Fingertip oxygen saturation monitor', 'OxyCheck', 'Units', 40, 10, 350.00, NULL, 'OXI-2024-022', 'Ward Equipment'),
('Stethoscope', 'Diagnostic Equipment', 'Auscultation', 'Professional stethoscope', 'SoundMed', 'Units', 25, 8, 800.00, NULL, 'STETH-2024-023', 'Ward Equipment'),

-- Laboratory Supplies
('Blood Collection Tube (EDTA)', 'Laboratory Supplies', 'Sample Collection', 'Vacuum blood collection tube', 'LabSupply', 'Tubes', 600, 120, 3.00, '2026-12-31', 'EDTA-2024-024', 'Lab Storage A'),
('Urine Collection Cup', 'Laboratory Supplies', 'Sample Collection', 'Sterile urine container', 'LabCare', 'Cups', 400, 80, 2.50, NULL, 'URINE-2024-025', 'Lab Storage B'),
('Syringe 5ml (Disposable)', 'Consumables', 'Injection Tool', 'Sterile disposable syringe', 'SyringeTech', 'Pieces', 800, 150, 4.50, NULL, 'SYR-2024-026', 'Medical Supplies'),
('Alcohol Swabs', 'Consumables', 'Antiseptic', 'Sterile alcohol prep pads', 'SterileCare', 'Packets (100 pcs)', 300, 60, 18.00, NULL, 'ALC-2024-027', 'Medical Supplies'),

-- Emergency Supplies
('Oxygen Cylinder', 'Emergency Supplies', 'Respiratory Support', 'Medical oxygen cylinder', 'OxyLife', 'Cylinders', 25, 8, 2500.00, NULL, 'OXY-2024-028', 'Emergency Room'),
('CPR Face Shield', 'Emergency Supplies', 'Resuscitation', 'CPR protective barrier', 'ResusKit', 'Pieces', 100, 20, 15.00, NULL, 'CPR-2024-029', 'Emergency Room'),
('Bandage Roll (6 inch)', 'Consumables', 'Wound Care', 'Elastic bandage roll', 'WoundCare', 'Rolls', 400, 80, 12.00, NULL, 'BAND-2024-030', 'Dressing Room');

INSERT INTO Lab_Test_Catalog (test_name, test_category, normal_range, unit, cost, is_active) VALUES
('Complete Blood Count (CBC)', 'Hematology', 'RBC: 4.5-5.5 M/µL, WBC: 4-11 K/µL', 'cells/µL', 300.00, TRUE),
('Blood Glucose (Fasting)', 'Biochemistry', '70-100', 'mg/dL', 150.00, TRUE),
('Lipid Profile', 'Biochemistry', 'Total Cholesterol: <200', 'mg/dL', 500.00, TRUE),
('Liver Function Test (LFT)', 'Biochemistry', 'ALT: 7-56 U/L, AST: 10-40 U/L', 'U/L', 600.00, TRUE),
('Kidney Function Test (KFT)', 'Biochemistry', 'Creatinine: 0.7-1.3', 'mg/dL', 550.00, TRUE),
('Thyroid Profile (T3, T4, TSH)', 'Endocrinology', 'TSH: 0.4-4.0', 'mIU/L', 700.00, TRUE),
('Urine Routine Examination', 'Urinalysis', 'pH: 4.5-8.0, Specific Gravity: 1.005-1.030', '-', 200.00, TRUE),
('X-Ray Chest (PA View)', 'Radiology', '-', '-', 400.00, TRUE),
('ECG (Electrocardiogram)', 'Cardiology', 'Heart Rate: 60-100 bpm', 'bpm', 350.00, TRUE),
('HbA1c (Glycated Hemoglobin)', 'Endocrinology', '<5.7% (Normal)', '%', 450.00, TRUE);