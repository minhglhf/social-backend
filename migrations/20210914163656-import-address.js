module.exports = {
  async up(db, client) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const data = require('./data.json');
    let provinces = [];
    let districts = [];
    let wards = [];
    for (const provinceItem of data) {
      const province = {
        _id: provinces.length + 1,
        name: provinceItem.Name,
      };
      provinces.push(province);
      for (const districtItem of provinceItem.Districts) {
        const district = {
          _id: districts.length + 100,
          province: province._id,
          name: districtItem.Name,
        };
        districts.push(district);
        for (const wardItem of districtItem.Wards) {
          const ward = {
            _id: wards.length + 1000,
            province: province._id,
            district: district._id,
            name: wardItem.Name,
          };
          wards.push(ward);
        }
      }
    }
    db.collection('provinces').createIndex({ name: 1 });
    db.collection('districts').createIndex({ name: 1 });
    db.collection('wards').createIndex({ name: 1 });
    db.collection('districts').createIndex({ province: 1 });
    db.collection('wards').createIndex({ district: 1 });
    db.collection('districts').createIndex(
      { _id: 1, province: 1 },
      { unique: true },
    );
    db.collection('wards').createIndex(
      { _id: 1, province: 1, district: 1 },
      { unique: true },
    );
    await db.collection('provinces').insertMany(provinces);
    await db.collection('districts').insertMany(districts);
    await db.collection('wards').insertMany(wards);
  },

  async down(db, client) {
    db.collection('provinces').drop();
    db.collection('districts').drop();
    db.collection('wards').drop();
  },
};
