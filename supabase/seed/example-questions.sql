-- REREVI example questions — ORIGINAL, paraphrased revision material (source = M).
-- Purpose: demonstrate the generator / lookup / AI-marking end to end. The owner
-- replaces/extends these via the admin dashboard. Safe to re-run (idempotent).
begin;

insert into documents (doc_id, title, source, components, topics, notes) values
  ('rerevi-examples', 'REREVI example questions', 'Original REREVI revision material', '{1,2,3}', '{1,2,3,4}',
   'Seed set written to demonstrate the tools. Replace with the real Question Bank.')
on conflict (doc_id) do nothing;

-- Reusable band descriptors (kept compact; one per tariff).
-- A=2, B=5, C=8, D=15.
insert into questions
  (qid, source, component, topic, question_type, tariff, locator, seq, spec_point, question_text, mark_scheme, indicative, spag)
values
-- Relationships (C1 T1)
('M.rerevi-examples.1.1.001.A','M',1,1,'A',2,'rerevi-examples',1,'RLP-1',
 'What is meant by ''cohabitation''?',
 '2 marks: a clear, accurate definition.'||chr(10)||'1 mark: a partially correct idea.'||chr(10)||'0: nothing creditworthy.',
 'Two people in a sexual relationship living together without being married.', false),
('M.rerevi-examples.1.1.002.B','M',1,1,'B',5,'rerevi-examples',2,'RLP-1',
 'Describe religious attitudes towards marriage.',
 'Band 3 (4–5): thorough, accurate description; developed points; correct specialist terms.'||chr(10)||'Band 2 (2–3): satisfactory; some accurate knowledge, partly developed.'||chr(10)||'Band 1 (1): basic, limited point.'||chr(10)||'0: nothing creditworthy.',
 'Marriage as a sacred covenant (Christianity); Nikah and its conditions (Islam); lifelong commitment; purposes of marriage.', false),
-- Life and Death (C1 T2) — full A–D
('M.rerevi-examples.1.2.001.A','M',1,2,'A',2,'rerevi-examples',1,'LD-2',
 'What is meant by the ''sanctity of life''?',
 '2 marks: a clear, accurate definition.'||chr(10)||'1 mark: partially correct.'||chr(10)||'0: nothing creditworthy.',
 'The belief that life is holy/God-given and therefore precious and to be protected.', false),
('M.rerevi-examples.1.2.002.B','M',1,2,'B',5,'rerevi-examples',2,'LD-3',
 'Describe religious beliefs about life after death.',
 'Band 3 (4–5): thorough, accurate, developed.'||chr(10)||'Band 2 (2–3): satisfactory, partly developed.'||chr(10)||'Band 1 (1): basic.'||chr(10)||'0: nothing creditworthy.',
 'Resurrection and judgement; heaven and hell; akhirah; the soul; Day of Judgement.', false),
('M.rerevi-examples.1.2.003.C','M',1,2,'C',8,'rerevi-examples',3,'LD-1',
 'Explain, from two religious traditions, teachings about the origins of the universe.',
 'Band 4 (7–8): comprehensive, two traditions, sustained reasoning, accurate terms.'||chr(10)||'Band 3 (5–6): good, mostly developed, relevant teachings.'||chr(10)||'Band 2 (3–4): satisfactory, limited development.'||chr(10)||'Band 1 (1–2): basic, fragmentary.'||chr(10)||'0: nothing creditworthy.',
 'Genesis creation; God as creator; Qur''an 7:54; literal vs non-literal readings; compatibility with the Big Bang.', false),
('M.rerevi-examples.1.2.004.D','M',1,2,'D',15,'rerevi-examples',4,'LD-1',
 '''Science has disproved religious accounts of creation.'' Evaluate this statement.',
 'Band 5 (13–15): sustained, balanced; well-reasoned both sides with teachings; justified conclusion.'||chr(10)||'Band 4 (10–12): coherent, developed both sides, conclusion.'||chr(10)||'Band 3 (7–9): some reasoning, may be one-sided; conclusion present.'||chr(10)||'Band 2 (4–6): limited, largely assertion.'||chr(10)||'Band 1 (1–3): basic, undeveloped.'||chr(10)||'0: nothing creditworthy.'||chr(10)||'[SPaG, where flagged: additional marks for accurate spelling, punctuation, grammar and specialist terms.]',
 'Big Bang vs Genesis; non-literal interpretation; science answers "how" not "why"; Dawkins; religious responses.', false),
-- Good and Evil (C1 T3) — full A–D
('M.rerevi-examples.1.3.001.A','M',1,3,'A',2,'rerevi-examples',1,'GE-3',
 'What is meant by ''free will''?',
 '2 marks: clear, accurate definition.'||chr(10)||'1 mark: partially correct.'||chr(10)||'0: nothing creditworthy.',
 'The God-given ability to make one''s own moral choices.', false),
('M.rerevi-examples.1.3.002.B','M',1,3,'B',5,'rerevi-examples',2,'GE-2',
 'Describe religious teachings about forgiveness.',
 'Band 3 (4–5): thorough, developed.'||chr(10)||'Band 2 (2–3): satisfactory.'||chr(10)||'Band 1 (1): basic.'||chr(10)||'0: nothing creditworthy.',
 'Matthew 18:21–22 (seventy times seven); repentance; mercy of Allah; reconciliation.', false),
('M.rerevi-examples.1.3.003.C','M',1,3,'C',8,'rerevi-examples',3,'GE-1',
 'Explain, from two religious traditions, different aims of punishment.',
 'Band 4 (7–8): comprehensive, two traditions, sustained.'||chr(10)||'Band 3 (5–6): good.'||chr(10)||'Band 2 (3–4): satisfactory.'||chr(10)||'Band 1 (1–2): basic.'||chr(10)||'0: nothing creditworthy.',
 'Retribution, deterrence, reformation, protection; justice; Shariah; Christian emphasis on reform.', false),
('M.rerevi-examples.1.3.004.D','M',1,3,'D',15,'rerevi-examples',4,'GE-3',
 '''Suffering proves there is no God.'' Evaluate this statement.',
 'Band 5 (13–15): sustained, balanced, justified conclusion.'||chr(10)||'Band 4 (10–12): coherent, developed both sides.'||chr(10)||'Band 3 (7–9): some reasoning.'||chr(10)||'Band 2 (4–6): limited.'||chr(10)||'Band 1 (1–3): basic.'||chr(10)||'0: nothing creditworthy.'||chr(10)||'[SPaG, where flagged: additional marks for accurate SPaG and specialist terms.]',
 'Problem of evil (Epicurus); free will defence; soul-making (Hick); al-Qadr; faith despite suffering.', false),
-- Human Rights (C1 T4)
('M.rerevi-examples.1.4.001.A','M',1,4,'A',2,'rerevi-examples',1,'HR-1',
 'What is meant by ''social justice''?',
 '2 marks: clear, accurate definition.'||chr(10)||'1 mark: partial.'||chr(10)||'0: nothing creditworthy.',
 'Ensuring society is fair and that everyone has equal rights and opportunities.', false),
('M.rerevi-examples.1.4.002.B','M',1,4,'B',5,'rerevi-examples',2,'HR-3',
 'Describe religious teachings about the use of wealth.',
 'Band 3 (4–5): thorough, developed.'||chr(10)||'Band 2 (2–3): satisfactory.'||chr(10)||'Band 1 (1): basic.'||chr(10)||'0: nothing creditworthy.',
 'Wealth as a responsibility; charity (Christian Aid, Islamic Relief); zakah; 1 Timothy 6:10.', false),
-- Christianity: Beliefs (C2 T1) — full A–D
('M.rerevi-examples.2.1.001.A','M',2,1,'A',2,'rerevi-examples',1,'CB-3',
 'What is meant by ''incarnation''?',
 '2 marks: clear, accurate definition.'||chr(10)||'1 mark: partial.'||chr(10)||'0: nothing creditworthy.',
 'God becoming human in the person of Jesus Christ.', false),
('M.rerevi-examples.2.1.002.B','M',2,1,'B',5,'rerevi-examples',2,'CB-1',
 'Describe Christian beliefs about the Trinity.',
 'Band 3 (4–5): thorough, developed.'||chr(10)||'Band 2 (2–3): satisfactory.'||chr(10)||'Band 1 (1): basic.'||chr(10)||'0: nothing creditworthy.',
 'One God in three persons: Father, Son, Holy Spirit; co-equal, co-eternal.', false),
('M.rerevi-examples.2.1.003.C','M',2,1,'C',8,'rerevi-examples',3,'CB-3',
 'Explain the significance of Jesus'' resurrection for Christians today.',
 'Band 4 (7–8): comprehensive, sustained.'||chr(10)||'Band 3 (5–6): good.'||chr(10)||'Band 2 (3–4): satisfactory.'||chr(10)||'Band 1 (1–2): basic.'||chr(10)||'0: nothing creditworthy.',
 'Victory over death; hope of eternal life; basis of faith (1 Cor 15); celebrated at Easter.', false),
('M.rerevi-examples.2.1.004.D','M',2,1,'D',15,'rerevi-examples',4,'CB-3',
 '''The resurrection is the most important Christian belief.'' Evaluate this statement.',
 'Band 5 (13–15): sustained, balanced, justified conclusion.'||chr(10)||'Band 4 (10–12): coherent.'||chr(10)||'Band 3 (7–9): some reasoning.'||chr(10)||'Band 2 (4–6): limited.'||chr(10)||'Band 1 (1–3): basic.'||chr(10)||'0: nothing creditworthy.'||chr(10)||'[SPaG, where flagged: additional marks for accurate SPaG and specialist terms.]',
 'Resurrection vs incarnation/crucifixion/Trinity; without resurrection faith is "in vain"; other beliefs underpin it too.', false),
-- Islam: Practices (C3 T2) — full A–D
('M.rerevi-examples.3.2.001.A','M',3,2,'A',2,'rerevi-examples',1,'IP-1',
 'What is meant by ''Hajj''?',
 '2 marks: clear, accurate definition.'||chr(10)||'1 mark: partial.'||chr(10)||'0: nothing creditworthy.',
 'The pilgrimage to Makkah every Muslim should make once if able; the fifth pillar.', false),
('M.rerevi-examples.3.2.002.B','M',3,2,'B',5,'rerevi-examples',2,'IP-1',
 'Describe how Muslims observe Sawm during Ramadan.',
 'Band 3 (4–5): thorough, developed.'||chr(10)||'Band 2 (2–3): satisfactory.'||chr(10)||'Band 1 (1): basic.'||chr(10)||'0: nothing creditworthy.',
 'Fasting dawn to sunset; no food, drink; suhur and iftar; spiritual discipline; exemptions.', false),
('M.rerevi-examples.3.2.003.C','M',3,2,'C',8,'rerevi-examples',3,'IP-1',
 'Explain the importance of the Five Pillars for Muslims.',
 'Band 4 (7–8): comprehensive, sustained.'||chr(10)||'Band 3 (5–6): good.'||chr(10)||'Band 2 (3–4): satisfactory.'||chr(10)||'Band 1 (1–2): basic.'||chr(10)||'0: nothing creditworthy.',
 'Shahadah, Salah, Zakah, Sawm, Hajj; foundation of practice; unity of the ummah.', false),
('M.rerevi-examples.3.2.004.D','M',3,2,'D',15,'rerevi-examples',4,'IP-1',
 '''Salah is the most important pillar of Islam.'' Evaluate this statement.',
 'Band 5 (13–15): sustained, balanced, justified conclusion.'||chr(10)||'Band 4 (10–12): coherent.'||chr(10)||'Band 3 (7–9): some reasoning.'||chr(10)||'Band 2 (4–6): limited.'||chr(10)||'Band 1 (1–3): basic.'||chr(10)||'0: nothing creditworthy.'||chr(10)||'[SPaG, where flagged: additional marks for accurate SPaG and specialist terms.]',
 'Salah five times daily vs Shahadah as the basis of faith; all pillars obligatory; intention.', false)
on conflict (qid) do nothing;

commit;
