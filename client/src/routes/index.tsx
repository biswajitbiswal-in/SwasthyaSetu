import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AshaDashboard } from '../pages/asha/AshaDashboard';
import { AshaPatients } from '../pages/asha/AshaPatients';
import { AshaConsultations } from '../pages/asha/AshaConsultations';
import { AshaSync } from '../pages/asha/AshaSync';
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { DoctorConsultation } from '../pages/doctor/DoctorConsultation';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminAuditLogs } from '../pages/admin/AdminAuditLogs';
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { PatientPrescriptions } from '../pages/patient/PatientPrescriptions';
import { PatientCall } from '../pages/patient/PatientCall';
import { PatientEmergency } from '../pages/patient/PatientEmergency';
import { useRole } from '../contexts/RoleContext';

// Dynamic Role Home Dispatcher
const RoleHomeDispatcher: React.FC = () => {
  const { currentUser } = useRole();

  if (currentUser.role === 'PATIENT') {
    return <PatientDashboard />;
  }

  if (currentUser.role === 'DOCTOR') {
    return <DoctorDashboard />;
  }

  if (currentUser.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <AshaDashboard />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RoleHomeDispatcher />,
      },
      // Patient / Citizen Views
      {
        path: 'patient',
        element: <PatientDashboard />,
      },
      {
        path: 'patient/prescriptions',
        element: <PatientPrescriptions />,
      },
      {
        path: 'patient/call',
        element: <PatientCall />,
      },
      {
        path: 'patient/emergency',
        element: <PatientEmergency />,
      },
      // Frontline Healthcare Worker Views
      {
        path: 'patients',
        element: <AshaPatients />,
      },
      {
        path: 'consultations',
        element: <AshaConsultations />,
      },
      {
        path: 'sync',
        element: <AshaSync />,
      },
      // Doctor Clinical Views
      {
        path: 'doctor',
        element: <DoctorDashboard />,
      },
      {
        path: 'doctor/telemedicine',
        element: <DoctorConsultation />,
      },
      // Admin Operations Views
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
      {
        path: 'admin/audit',
        element: <AdminAuditLogs />,
      },
      // Catch-all
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
