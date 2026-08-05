import { Link } from 'react-router-dom';
import { DEFAULT_MODULE_PATH } from '../config/modules';

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-2xl place-items-center px-4 py-24 text-center">
      <div className="glass w-full p-10">
        <p className="text-6xl font-extrabold tracking-tight text-brand-400">404</p>
        <h1 className="mt-3 text-2xl font-bold text-white">This page is off the map</h1>
        <p className="mt-2 text-sm text-slate-400">
          The page you were looking for does not exist in CampusBuddy.
        </p>
        <Link to={DEFAULT_MODULE_PATH} className="btn-primary mt-7">
          <span aria-hidden="true">🗺</span>
          Back to Map Buddy
        </Link>
      </div>
    </div>
  );
}
