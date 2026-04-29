
import bdLocations from "./data/bangladesh_locations.json";

export interface District {
  district: string;
  coordinates: string;
  upazilla: string[];
}

export interface Division {
  division: string;
  divisionbn: string;
  districts: District[];
}

export const getDivisions = () => {
  const data = (bdLocations as any).default || bdLocations;
  return (data as Division[]).map(d => ({
    name: d.division,
    bnName: d.divisionbn
  }));
};

export const getDistrictsByDivision = (divisionName: string) => {
  const data = (bdLocations as any).default || bdLocations;
  const div = (data as Division[]).find(
    d => d.division.toLowerCase() === divisionName.toLowerCase()
  );
  return div ? div.districts.map(dist => ({
    name: dist.district,
    upazilas: dist.upazilla
  })) : [];
};

export const getAllDistricts = () => {
  const data = (bdLocations as any).default || bdLocations;
  const allDistricts: string[] = [];
  (data as Division[]).forEach(div => {
    div.districts.forEach(dist => {
      allDistricts.push(dist.district);
    });
  });
  return allDistricts.sort();
};

export const getUpazilasByDistrict = (districtName: string) => {
  const data = (bdLocations as any).default || bdLocations;
  for (const div of (data as Division[])) {
    const dist = div.districts.find(
      d => d.district.toLowerCase() === districtName.toLowerCase()
    );
    if (dist) return dist.upazilla;
  }
  return [];
};
