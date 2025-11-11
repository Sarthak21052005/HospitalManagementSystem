    -- ========================================
    -- HOSPITAL MANAGEMENT SYSTEM
    -- Production Schema with Stored Procedures & Triggers
    -- ========================================

    -- Drop indexes first
    DROP INDEX IF EXISTS idx_prescription_record CASCADE;
    DROP INDEX IF EXISTS idx_prescription_patient CASCADE;
    DROP INDEX IF EXISTS idx_vital_signs_patient CASCADE;
    DROP INDEX IF EXISTS idx_vital_signs_nurse CASCADE;
    DROP INDEX IF EXISTS idx_vital_signs_record CASCADE;
    DROP INDEX IF EXISTS idx_vital_signs_date CASCADE;
    DROP INDEX IF EXISTS idx_task_status CASCADE;
    DROP INDEX IF EXISTS idx_task_priority CASCADE;
    DROP INDEX IF EXISTS idx_task_nurse CASCADE;
    DROP INDEX IF EXISTS idx_task_patient CASCADE;
    DROP INDEX IF EXISTS idx_task_record CASCADE;
    DROP INDEX IF EXISTS IDX_session_expire CASCADE;

    -- Drop existing tables
    DROP TABLE IF EXISTS Lab_Order_Test CASCADE;
    DROP TABLE IF EXISTS Lab_Order CASCADE;
    DROP TABLE IF EXISTS Task CASCADE;
    DROP TABLE IF EXISTS Vital_Signs CASCADE;
    DROP TABLE IF EXISTS Prescription CASCADE;
    DROP TABLE IF EXISTS IPD_Admission CASCADE;
    DROP TABLE IF EXISTS Bill_Item CASCADE;
    DROP TABLE IF EXISTS Bill CASCADE;
    DROP TABLE IF EXISTS Appointment CASCADE;
    DROP TABLE IF EXISTS Medical_Record CASCADE;
    DROP TABLE IF EXISTS Inventory_Transaction CASCADE;
    DROP TABLE IF EXISTS Medical_Inventory CASCADE;
    DROP TABLE IF EXISTS Lab_Test_Catalog CASCADE;
    DROP TABLE IF EXISTS Lab_Technician CASCADE;
    DROP TABLE IF EXISTS Doctor_Ward_Schedule CASCADE;
    DROP TABLE IF EXISTS Nurse_Ward_Schedule CASCADE;
    DROP TABLE IF EXISTS Ward_Nurse CASCADE;
    DROP TABLE IF EXISTS Bed CASCADE;
    DROP TABLE IF EXISTS Nurse CASCADE;
    DROP TABLE IF EXISTS Doctor CASCADE;
    DROP TABLE IF EXISTS Admin CASCADE;
    DROP TABLE IF EXISTS Patient CASCADE;
    DROP TABLE IF EXISTS Ward CASCADE;
    DROP TABLE IF EXISTS session CASCADE;

    -- ===== CORE TABLES =====

    CREATE TABLE Ward (
        ward_id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        capacity INT NOT NULL CHECK (capacity > 0),
        bed_capacity INT NOT NULL DEFAULT 10
    );

    CREATE TABLE Patient (
        patient_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL CHECK (age >= 0),
        gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
        contact VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        emergency_contact VARCHAR(20),
        blood_type VARCHAR(5) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        date_registered DATE NOT NULL DEFAULT CURRENT_DATE,
        time_registered TIME NOT NULL DEFAULT CURRENT_TIME,
        is_serious_case BOOLEAN NOT NULL DEFAULT FALSE,
        serious_case_notes TEXT,
        date_admission DATE,
        date_discharge DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Admin (
        admin_id VARCHAR(50) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Doctor (
        doctor_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        contact VARCHAR(20) NOT NULL,
        working_hours VARCHAR(50) DEFAULT '9AM-5PM',
        date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Nurse (
        nurse_id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(20) NOT NULL,
        hired_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Lab_Technician (
        technician_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(15),
        specialization VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Lab_Test_Catalog (
        test_id SERIAL PRIMARY KEY,
        test_name VARCHAR(100) NOT NULL,
        test_category VARCHAR(50),
        normal_range VARCHAR(100),
        unit VARCHAR(20),
        cost DECIMAL(10,2),
        is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE Medical_Inventory (
        item_id SERIAL PRIMARY KEY,
        item_name VARCHAR(200) NOT NULL,
        item_category VARCHAR(50) NOT NULL CHECK (item_category IN (
            'Medicine', 'Injection', 'Surgical Equipment', 'Diagnostic Equipment',
            'PPE', 'Consumables', 'Laboratory Supplies', 'Emergency Supplies', 'Other'
        )),
        item_type VARCHAR(100),
        description TEXT,
        manufacturer VARCHAR(200),
        unit_of_measure VARCHAR(20) NOT NULL DEFAULT 'Units',
        quantity_in_stock INT NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
        reorder_level INT NOT NULL DEFAULT 10,
        unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        total_value DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_in_stock * unit_price) STORED,
        expiry_date DATE,
        batch_number VARCHAR(50),
        storage_location VARCHAR(100),
        status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock', 'expired')),
        last_restocked DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Inventory_Transaction (
        transaction_id SERIAL PRIMARY KEY,
        item_id INT REFERENCES Medical_Inventory(item_id) ON DELETE CASCADE,
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('restock', 'usage', 'expired', 'damaged', 'adjustment')),
        quantity_changed INT NOT NULL,
        quantity_before INT NOT NULL,
        quantity_after INT NOT NULL,
        reason TEXT,
        performed_by VARCHAR(100),
        transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Bed (
        bed_id SERIAL PRIMARY KEY,
        ward_id INT REFERENCES Ward(ward_id) ON DELETE SET NULL,
        bed_number VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
        current_patient_id INT REFERENCES Patient(patient_id) ON DELETE SET NULL,
        UNIQUE(ward_id, bed_number)
    );

    CREATE TABLE Doctor_Ward_Schedule (
        schedule_id SERIAL PRIMARY KEY,
        doctor_id INT REFERENCES Doctor(doctor_id) ON DELETE CASCADE,
        ward_id INT REFERENCES Ward(ward_id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_week_range CHECK (week_end >= week_start)
    );

    CREATE TABLE Nurse_Ward_Schedule (
        schedule_id SERIAL PRIMARY KEY,
        nurse_id INT REFERENCES Nurse(nurse_id) ON DELETE CASCADE,
        ward_id INT REFERENCES Ward(ward_id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        week_end DATE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_nurse_week_range CHECK (week_end >= week_start)
    );

    CREATE TABLE Ward_Nurse (
        ward_nurse_id SERIAL PRIMARY KEY,
        ward_id INT REFERENCES Ward(ward_id) ON DELETE CASCADE,
        nurse_id INT REFERENCES Nurse(nurse_id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Appointment (
        appointment_id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES Patient(patient_id) ON DELETE CASCADE,
        doctor_id INT REFERENCES Doctor(doctor_id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        time_slot TIME NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
        diagnosis TEXT,
        prescription TEXT,
        notes TEXT,
        consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Medical_Record (
        record_id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES Patient(patient_id) ON DELETE CASCADE,
        doctor_id INT REFERENCES Doctor(doctor_id) ON DELETE CASCADE,
        appointment_id INT REFERENCES Appointment(appointment_id) ON DELETE SET NULL,
        visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
        diagnosis TEXT NOT NULL,
        prescription TEXT,
        notes JSONB,
        nursing_notes TEXT,
        follow_up_date DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Prescription (
        prescription_id SERIAL PRIMARY KEY,
        record_id INTEGER NOT NULL REFERENCES Medical_Record(record_id) ON DELETE CASCADE,
        patient_id INTEGER NOT NULL REFERENCES Patient(patient_id) ON DELETE CASCADE,
        doctor_id INTEGER NOT NULL REFERENCES Doctor(doctor_id) ON DELETE CASCADE,
        medicine_name VARCHAR(200) NOT NULL,
        dosage VARCHAR(100) NOT NULL,
        frequency VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        quantity_prescribed INTEGER NOT NULL DEFAULT 1,
        instructions TEXT,
        prescribed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_prescription_record ON Prescription(record_id);
    CREATE INDEX idx_prescription_patient ON Prescription(patient_id);

    CREATE TABLE Vital_Signs (
        vital_id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL REFERENCES Patient(patient_id) ON DELETE CASCADE,
        nurse_id INTEGER NOT NULL REFERENCES Nurse(nurse_id) ON DELETE CASCADE,
        record_id INTEGER REFERENCES Medical_Record(record_id) ON DELETE SET NULL,
        temperature DECIMAL(5, 2),
        blood_pressure VARCHAR(20),
        pulse_rate INTEGER,
        respiratory_rate INTEGER,
        oxygen_saturation INTEGER CHECK (oxygen_saturation BETWEEN 0 AND 100),
        notes TEXT,
        recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_vital_signs_patient ON Vital_Signs(patient_id);
    CREATE INDEX idx_vital_signs_nurse ON Vital_Signs(nurse_id);
    CREATE INDEX idx_vital_signs_record ON Vital_Signs(record_id);
    CREATE INDEX idx_vital_signs_date ON Vital_Signs(recorded_at);

    CREATE TABLE Task (
        task_id SERIAL PRIMARY KEY,
        record_id INTEGER NOT NULL REFERENCES Medical_Record(record_id) ON DELETE CASCADE,
        patient_id INTEGER NOT NULL REFERENCES Patient(patient_id) ON DELETE CASCADE,
        doctor_id INTEGER NOT NULL REFERENCES Doctor(doctor_id) ON DELETE CASCADE,
        assigned_nurse_id INTEGER REFERENCES Nurse(nurse_id) ON DELETE SET NULL,
        task_type VARCHAR(50) NOT NULL DEFAULT 'REVIEW_REPORT',
        priority VARCHAR(20) DEFAULT 'ROUTINE',
        status VARCHAR(20) DEFAULT 'PENDING',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT valid_task_type CHECK (task_type IN ('REVIEW_REPORT', 'ADMINISTER_MEDICATION', 'MONITOR_VITALS', 'FOLLOW_UP', 'OTHER')),
        CONSTRAINT valid_priority CHECK (priority IN ('ROUTINE', 'URGENT', 'STAT')),
        CONSTRAINT valid_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'))
    );

    CREATE INDEX idx_task_status ON Task(status);
    CREATE INDEX idx_task_priority ON Task(priority);
    CREATE INDEX idx_task_nurse ON Task(assigned_nurse_id);
    CREATE INDEX idx_task_patient ON Task(patient_id);
    CREATE INDEX idx_task_record ON Task(record_id);

    CREATE TABLE IPD_Admission (
        admission_id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES Patient(patient_id) ON DELETE CASCADE,
        bed_id INT REFERENCES Bed(bed_id) ON DELETE SET NULL,
        doctor_id INT REFERENCES Doctor(doctor_id) ON DELETE SET NULL,
        admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
        admission_time TIME NOT NULL DEFAULT CURRENT_TIME,
        admission_reason TEXT NOT NULL,
        expected_discharge_date DATE,
        discharge_date DATE,
        discharge_time TIME,
        discharge_summary TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Lab_Order (
        order_id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES Patient(patient_id),
        doctor_id INTEGER REFERENCES Doctor(doctor_id),
        record_id INTEGER REFERENCES Medical_Record(record_id),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        urgency VARCHAR(20) DEFAULT 'ROUTINE' CHECK (urgency IN ('ROUTINE', 'URGENT', 'STAT')),
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
        clinical_notes TEXT,
        technician_id INTEGER REFERENCES Lab_Technician(technician_id),
        completed_date TIMESTAMP
    );

    CREATE TABLE Lab_Order_Test (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES Lab_Order(order_id) ON DELETE CASCADE,
        test_id INTEGER REFERENCES Lab_Test_Catalog(test_id),
        result_value VARCHAR(200),
        is_abnormal BOOLEAN DEFAULT FALSE,
        technician_notes TEXT,
        result_date TIMESTAMP
    );

    CREATE TABLE Bill (
        bill_id SERIAL PRIMARY KEY,
        patient_id INT REFERENCES Patient(patient_id) ON DELETE CASCADE,
        admission_id INT REFERENCES IPD_Admission(admission_id) ON DELETE SET NULL,
        bill_date DATE NOT NULL DEFAULT CURRENT_DATE,
        total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(20),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE Bill_Item (
        item_id SERIAL PRIMARY KEY,
        bill_id INT REFERENCES Bill(bill_id) ON DELETE CASCADE,
        item_type VARCHAR(20) NOT NULL,
        description TEXT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        CONSTRAINT session_pkey PRIMARY KEY (sid)
    );

    CREATE INDEX IDX_session_expire ON session (expire);

    -- ========================================
    -- STORED PROCEDURES
    -- ========================================

    CREATE OR REPLACE FUNCTION sp_admit_patient_to_bed(
        p_patient_id INT,
        p_bed_id INT,
        p_doctor_id INT,
        p_admission_reason TEXT
    ) RETURNS TABLE(
        admission_id INT,
        message TEXT,
        success BOOLEAN
    ) AS $$
    DECLARE
        v_bed_status VARCHAR(20);
        v_new_admission_id INT;
    BEGIN
        SELECT status INTO v_bed_status FROM Bed WHERE bed_id = p_bed_id;
        
        IF v_bed_status IS NULL THEN
            RETURN QUERY SELECT NULL::INT, 'Bed not found'::TEXT, FALSE;
            RETURN;
        END IF;
        
        IF v_bed_status != 'available' THEN
            RETURN QUERY SELECT NULL::INT, 'Bed is not available'::TEXT, FALSE;
            RETURN;
        END IF;
        
        INSERT INTO IPD_Admission (patient_id, bed_id, doctor_id, admission_reason, admission_date, admission_time, status)
        VALUES (p_patient_id, p_bed_id, p_doctor_id, p_admission_reason, CURRENT_DATE, CURRENT_TIME, 'active')
        RETURNING IPD_Admission.admission_id INTO v_new_admission_id;
        
        UPDATE Bed SET status = 'occupied', current_patient_id = p_patient_id WHERE bed_id = p_bed_id;
        UPDATE Patient SET date_admission = CURRENT_DATE WHERE patient_id = p_patient_id;
        
        RETURN QUERY SELECT v_new_admission_id, 'Patient admitted successfully'::TEXT, TRUE;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION sp_discharge_patient(
        p_admission_id INT,
        p_discharge_summary TEXT
    ) RETURNS TABLE(
        message TEXT,
        success BOOLEAN
    ) AS $$
    DECLARE
        v_bed_id INT;
        v_patient_id INT;
    BEGIN
        SELECT bed_id, patient_id INTO v_bed_id, v_patient_id 
        FROM IPD_Admission WHERE admission_id = p_admission_id;
        
        IF v_bed_id IS NULL THEN
            RETURN QUERY SELECT 'Admission not found'::TEXT, FALSE;
            RETURN;
        END IF;
        
        UPDATE IPD_Admission 
        SET discharge_date = CURRENT_DATE, 
            discharge_time = CURRENT_TIME, 
            discharge_summary = p_discharge_summary,
            status = 'discharged'
        WHERE admission_id = p_admission_id;
        
        UPDATE Bed SET status = 'available', current_patient_id = NULL WHERE bed_id = v_bed_id;
        UPDATE Patient SET date_discharge = CURRENT_DATE WHERE patient_id = v_patient_id;
        
        RETURN QUERY SELECT 'Patient discharged successfully'::TEXT, TRUE;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION sp_update_inventory_stock(
        p_item_id INT,
        p_quantity_change INT,
        p_transaction_type VARCHAR(20),
        p_reason TEXT,
        p_performed_by VARCHAR(100)
    ) RETURNS TABLE(
        new_quantity INT,
        message TEXT,
        success BOOLEAN
    ) AS $$
    DECLARE
        v_current_quantity INT;
        v_new_quantity INT;
    BEGIN
        SELECT quantity_in_stock INTO v_current_quantity FROM Medical_Inventory WHERE item_id = p_item_id;
        
        IF v_current_quantity IS NULL THEN
            RETURN QUERY SELECT NULL::INT, 'Item not found'::TEXT, FALSE;
            RETURN;
        END IF;
        
        v_new_quantity := v_current_quantity + p_quantity_change;
        
        IF v_new_quantity < 0 THEN
            RETURN QUERY SELECT NULL::INT, 'Insufficient stock'::TEXT, FALSE;
            RETURN;
        END IF;
        
        UPDATE Medical_Inventory SET quantity_in_stock = v_new_quantity WHERE item_id = p_item_id;
        
        INSERT INTO Inventory_Transaction (item_id, transaction_type, quantity_changed, quantity_before, quantity_after, reason, performed_by)
        VALUES (p_item_id, p_transaction_type, p_quantity_change, v_current_quantity, v_new_quantity, p_reason, p_performed_by);
        
        RETURN QUERY SELECT v_new_quantity, 'Inventory updated successfully'::TEXT, TRUE;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION sp_assign_nurse_to_ward(
        p_nurse_id INT,
        p_ward_id INT,
        p_week_start DATE,
        p_week_end DATE
    ) RETURNS TABLE(
        schedule_id INT,
        message TEXT,
        success BOOLEAN
    ) AS $$
    DECLARE
        v_schedule_id INT;
    BEGIN
        IF EXISTS (
            SELECT 1 FROM Nurse_Ward_Schedule 
            WHERE nurse_id = p_nurse_id 
            AND (
                (p_week_start BETWEEN week_start AND week_end) OR
                (p_week_end BETWEEN week_start AND week_end)
            )
        ) THEN
            RETURN QUERY SELECT NULL::INT, 'Nurse already scheduled for overlapping period'::TEXT, FALSE;
            RETURN;
        END IF;
        
        INSERT INTO Nurse_Ward_Schedule (nurse_id, ward_id, week_start, week_end)
        VALUES (p_nurse_id, p_ward_id, p_week_start, p_week_end)
        RETURNING Nurse_Ward_Schedule.schedule_id INTO v_schedule_id;
        
        RETURN QUERY SELECT v_schedule_id, 'Nurse assigned to ward successfully'::TEXT, TRUE;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION sp_assign_doctor_to_ward(
        p_doctor_id INT,
        p_ward_id INT,
        p_week_start DATE,
        p_week_end DATE
    ) RETURNS TABLE(
        schedule_id INT,
        message TEXT,
        success BOOLEAN
    ) AS $$
    DECLARE
        v_schedule_id INT;
    BEGIN
        IF EXISTS (
            SELECT 1 FROM Doctor_Ward_Schedule 
            WHERE doctor_id = p_doctor_id 
            AND (
                (p_week_start BETWEEN week_start AND week_end) OR
                (p_week_end BETWEEN week_start AND week_end)
            )
        ) THEN
            RETURN QUERY SELECT NULL::INT, 'Doctor already scheduled for overlapping period'::TEXT, FALSE;
            RETURN;
        END IF;
        
        INSERT INTO Doctor_Ward_Schedule (doctor_id, ward_id, week_start, week_end)
        VALUES (p_doctor_id, p_ward_id, p_week_start, p_week_end)
        RETURNING Doctor_Ward_Schedule.schedule_id INTO v_schedule_id;
        
        RETURN QUERY SELECT v_schedule_id, 'Doctor assigned to ward successfully'::TEXT, TRUE;
    END;
    $$ LANGUAGE plpgsql;

    -- ========================================
    -- TRIGGERS
    -- ========================================

    CREATE OR REPLACE FUNCTION update_inventory_status()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.quantity_in_stock = 0 THEN
            NEW.status = 'out_of_stock';
        ELSIF NEW.quantity_in_stock <= NEW.reorder_level THEN
            NEW.status = 'low_stock';
        ELSIF NEW.expiry_date IS NOT NULL AND NEW.expiry_date < CURRENT_DATE THEN
            NEW.status = 'expired';
        ELSE
            NEW.status = 'available';
        END IF;
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER inventory_status_trigger
    BEFORE INSERT OR UPDATE ON Medical_Inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_status();

    CREATE OR REPLACE FUNCTION update_medical_record_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER medical_record_update_trigger
    BEFORE UPDATE ON Medical_Record
    FOR EACH ROW
    EXECUTE FUNCTION update_medical_record_timestamp();

    CREATE OR REPLACE FUNCTION create_task_on_medical_record()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO Task (record_id, patient_id, doctor_id, task_type, priority, status, notes)
        VALUES (
            NEW.record_id, 
            NEW.patient_id, 
            NEW.doctor_id, 
            'REVIEW_REPORT',
            CASE WHEN (SELECT is_serious_case FROM Patient WHERE patient_id = NEW.patient_id) THEN 'URGENT' ELSE 'ROUTINE' END,
            'PENDING',
            'Review medical report for patient ' || NEW.patient_id
        );
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER task_creation_trigger
    AFTER INSERT ON Medical_Record
    FOR EACH ROW
    EXECUTE FUNCTION create_task_on_medical_record();

    CREATE OR REPLACE FUNCTION prevent_bed_double_booking()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.status = 'occupied' AND OLD.status = 'occupied' AND NEW.current_patient_id != OLD.current_patient_id THEN
            RAISE EXCEPTION 'Bed is already occupied by another patient';
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER bed_booking_trigger
    BEFORE UPDATE ON Bed
    FOR EACH ROW
    EXECUTE FUNCTION prevent_bed_double_booking();

    -- ========================================
    -- ESSENTIAL DEFAULT DATA ONLY
    -- ========================================

    -- Admin account (required for first login)
    INSERT INTO Admin (admin_id, password) VALUES ('admin123', '123456');

    -- Wards (required for hospital operations)
    INSERT INTO Ward (name, category, location, capacity, bed_capacity) VALUES
    ('General Ward', 'General', 'Ground Floor', 20, 20),
    ('ICU', 'Critical Care', 'First Floor', 10, 10),
    ('Pediatric Ward', 'Pediatrics', 'Second Floor', 15, 15),
    ('Emergency Ward', 'Emergency', 'Ground Floor', 8, 8),
    ('Maternity Ward', 'Maternity', 'Third Floor', 12, 12);

    -- Beds (required for admissions)
    INSERT INTO Bed (ward_id, bed_number, status) VALUES
    (1, 'G-001', 'available'), (1, 'G-002', 'available'), (1, 'G-003', 'available'),
    (1, 'G-004', 'available'), (1, 'G-005', 'available'),
    (2, 'ICU-001', 'available'), (2, 'ICU-002', 'available'), (2, 'ICU-003', 'available'),
    (3, 'P-001', 'available'), (3, 'P-002', 'available'), (3, 'P-003', 'available');

    -- Success messages
    SELECT '✅ DATABASE SETUP COMPLETE!' as status;
    SELECT '🏥 All tables created successfully!' as message;
    SELECT '⚙️ 5 Stored Procedures added!' as stored_procedures;
    SELECT '🔔 4 Triggers with automation active!' as triggers;
    SELECT '🛏️ Wards and Beds ready for use!' as infrastructure;
