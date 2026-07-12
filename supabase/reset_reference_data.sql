-- Run this once to fix duplicate provinces/districts/clusters/types caused by
-- running schema.sql more than once. Safe as long as no activities/people
-- reference these rows yet (cascades would remove those links otherwise).

truncate table village_clusters, activity_sub_types, districts, activity_main_types, provinces cascade;

with prov as (
  insert into provinces (name) values
    ('ນະຄອນຫຼວງວຽງຈັນ'),
    ('ຫຼວງພະບາງ'),
    ('ຈຳປາສັກ')
  returning id, name
),
dist as (
  insert into districts (province_id, name)
  select id, d.name from prov, (values
    ('ນະຄອນຫຼວງວຽງຈັນ', 'ຈັນທະບູລີ'),
    ('ນະຄອນຫຼວງວຽງຈັນ', 'ສີສັດຕະນາກ'),
    ('ນະຄອນຫຼວງວຽງຈັນ', 'ໄຊເສດຖາ'),
    ('ຫຼວງພະບາງ', 'ເມືອງຫຼວງພະບາງ'),
    ('ຫຼວງພະບາງ', 'ນ້ຳບາກ'),
    ('ຈຳປາສັກ', 'ໂພນທອງ'),
    ('ຈຳປາສັກ', 'ປາກເຊ')
  ) as d(province_name, name)
  where prov.name = d.province_name
  returning id, name, province_id
),
clus as (
  insert into village_clusters (district_id, name)
  select id, c.name from dist, (values
    ('ຈັນທະບູລີ', 'ສຸກສາລາ ບ້ານໂພນສີນວນ'),
    ('ຈັນທະບູລີ', 'ສຸກສາລາ ບ້ານທົ່ງກາງ'),
    ('ເມືອງຫຼວງພະບາງ', 'ສຸກສາລາ ບ້ານວັດຈອມສີ'),
    ('ປາກເຊ', 'ສຸກສາລາ ບ້ານໂພນສະອາດ')
  ) as c(district_name, name)
  where dist.name = c.district_name
  returning id
),
main as (
  insert into activity_main_types (name) values
    ('ຝຶກອົບຮົມ (Training)'),
    ('ປະຊຸມ (Meeting)'),
    ('ສຳມະນາ (Seminar)'),
    ('ເວີກຊອບ (Workshop)')
  returning id, name
),
sub as (
  insert into activity_sub_types (main_id, name)
  select id, s.name from main, (values
    ('ຝຶກອົບຮົມ (Training)', 'ຝຶກອົບຮົມວິຊາການ'),
    ('ຝຶກອົບຮົມ (Training)', 'ຝຶກອົບຮົມທັກສະ'),
    ('ປະຊຸມ (Meeting)', 'ປະຊຸມສາມັນ'),
    ('ປະຊຸມ (Meeting)', 'ປະຊຸມວິສາມັນ'),
    ('ສຳມະນາ (Seminar)', 'ສຳມະນາທາງວິຊາການ'),
    ('ເວີກຊອບ (Workshop)', 'ເວີກຊອບການວາງແຜນ')
  ) as s(main_name, name)
  where main.name = s.main_name
  returning id
)
select 1;
