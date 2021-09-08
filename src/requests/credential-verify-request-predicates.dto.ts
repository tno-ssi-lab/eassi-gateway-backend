type PredicateName = string;

interface Predicate {
  name: string;
  p_type: string;
  p_value: string | number | boolean;
}

export type CredentialPredicates = Record<PredicateName, Predicate>;
