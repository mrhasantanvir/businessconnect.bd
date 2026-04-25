
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
  return (bdLocations as Division[]).map(d => ({
    name: d.division,
    bnName: d.divisionbn
  }));
};

export const getDistrictsByDivision = (divisionName: string) => {
  const div = (bdLocations as Division[]).find(
    d => d.division.toLowerCase() === divisionName.toLowerCase()
  );
  return div ? div.districts.map(dist => ({
    name: dist.district,
    upazilas: dist.upazilla
  })) : [];
};

export const getAllDistricts = () => {
  const allDistricts: string[] = [];
  (bdLocations as Division[]).forEach(div => {
    div.districts.forEach(dist => {
      allDistricts.push(dist.district);
    });
  });
  return allDistricts.sort();
};

export const getUpazilasByDistrict = (districtName: string) => {
  for (const div of (bdLocations as Division[])) {
    const dist = div.districts.find(
      d => d.district.toLowerCase() === districtName.toLowerCase()
    );
    if (dist) return dist.upazilla;
  }
  return [];
};
