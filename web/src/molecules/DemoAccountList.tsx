import { DesktopOutlined, MobileOutlined } from '@ant-design/icons';
import type { DemoAccount } from '@/mocks/demoAccounts';

interface DemoAccountListProps {
  accounts: DemoAccount[];
  onSelect: (account: DemoAccount) => void;
  disabled?: boolean;
}

/** Accesos rápidos del prototipo; desaparecen al usar la API real. */
export function DemoAccountList({ accounts, onSelect, disabled }: DemoAccountListProps) {
  return (
    <div className="tz-demo">
      <span className="tz-demo__title">Entrar con una cuenta de demostración</span>
      <div className="tz-demo__grid">
        {accounts.map((account) => (
          <button
            key={account.email}
            type="button"
            className="tz-demo__item"
            onClick={() => onSelect(account)}
            disabled={disabled}
          >
            <span className="tz-demo__icon">{account.app === 'panel' ? <DesktopOutlined /> : <MobileOutlined />}</span>
            <span className="tz-demo__text">
              <strong>{account.label}</strong>
              <small>{account.description}</small>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
