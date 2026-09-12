import Image from "next/image";

import { MenuNav, type MenuNavGroup } from "@/components/menu-nav";
import {
  formatPrice,
  type MenuDocument,
  type MenuItem,
} from "@/lib/menu-data";
import { cn } from "@/lib/utils";

const NAME =
  "tracked-label text-[0.78rem] leading-[1.7] tracking-[0.14em] uppercase md:text-[0.82rem]";

const DESCRIPTION =
  "mt-2 text-[0.8rem] leading-[1.85] text-pretty text-foreground/55 md:text-[0.84rem]";

const PRICE = "text-[0.82rem] whitespace-nowrap tabular-nums md:text-[0.86rem]";

/** The run of dots between a name and its price. */
const LEADER = "min-w-6 flex-1 border-b border-dotted border-foreground/30";

type ItemProps = {
  item: MenuItem;
  currency: string;
};

/**
 * One row. A single price sits on the same line as the name, with the leader
 * running between them; a set of options gets a line each below the
 * description, so a long label never crowds the name.
 *
 * Prices are isolated left-to-right: an amount and a currency mark carry no
 * direction of their own, and would otherwise be reordered inside Arabic copy.
 */
function Row({ item, currency }: ItemProps) {
  const options = item.priceOptions;
  const single =
    item.price !== undefined
      ? formatPrice(item.price, currency)
      : item.priceText !== undefined
        ? formatPrice(item.priceText, currency)
        : null;

  return (
    <li className="border-b border-dotted border-foreground/20 pb-7">
      {options ? (
        <>
          <h4 className={NAME}>{item.name}</h4>
          {item.description ? (
            <p className={DESCRIPTION}>{item.description}</p>
          ) : null}

          <ul className="mt-3 space-y-2">
            {options.map((option) => (
              <li
                key={option.label}
                className="flex items-baseline gap-3 text-[0.78rem] text-foreground/60 md:text-[0.82rem]"
              >
                <span>{option.label}</span>
                <span aria-hidden="true" className={LEADER} />
                <span className={cn(PRICE, "text-foreground")}>
                  <bdi dir="ltr">{formatPrice(option.price, currency)}</bdi>
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="flex items-baseline gap-3">
            <h4 className={NAME}>{item.name}</h4>
            <span aria-hidden="true" className={LEADER} />
            {single ? (
              <span className={PRICE}>
                <bdi dir="ltr">{single}</bdi>
              </span>
            ) : null}
          </div>

          {item.description ? (
            <p className={DESCRIPTION}>{item.description}</p>
          ) : null}
        </>
      )}
    </li>
  );
}

/**
 * One half of the menu: the food, then the drinks. Each arrives as its own
 * document — its own currency, its own top-level note — and is announced on the
 * page by the divider carrying `label`, which `id` also makes linkable from
 * elsewhere on the site.
 */
export type MenuGroup = {
  id: string;
  label: string;
  menu: MenuDocument;
};

type MenuScreenProps = {
  title: string;
  image: string;
  groups: MenuGroup[];
  /** Opens the section list on the screens too narrow for the chip row. */
  sectionsLabel: string;
};

/**
 * The whole menu: a still, the title, the sticky category bar, then each group
 * behind its own large divider — every section a centred heading over a
 * two-column run of rows, one column below md.
 *
 * Nothing here is mirrored by hand; centred headings and logical spacing read
 * the same in both directions.
 */
export function MenuScreen({
  title,
  image,
  groups,
  sectionsLabel,
}: MenuScreenProps) {
  const navGroups: MenuNavGroup[] = groups.map((group) => ({
    id: group.id,
    label: group.label,
    sections: group.menu.sections.map(({ id, title: label }) => ({
      id,
      title: label,
    })),
  }));

  return (
    <article className="bg-background text-foreground">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="relative mx-auto aspect-[3/2] w-full max-w-[1600px] overflow-hidden bg-foreground/5 sm:aspect-[5/2] md:aspect-auto md:h-[46svh]">
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
        </div>
      </div>

      <header className="px-4 pt-16 pb-12 text-center sm:px-6 md:px-8 md:pt-24 md:pb-16 lg:px-12">
        <h1 className="display-tight text-[clamp(2.3rem,7.5vw,4.6rem)] leading-[1.12]">
          {title}
        </h1>
      </header>

      <MenuNav
        groups={navGroups}
        label={title}
        sectionsLabel={sectionsLabel}
      />

      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-[72rem] pb-24 md:pb-32">
          {groups.map((group) => (
            // The break before each half is carried out here rather than on
            // the divider itself, so a jump to #food or #drinks lands on the
            // heading with the same air a jump to a section gets.
            <div key={group.id} className="pt-24 md:pt-36">
              {/* The divider between the two halves of the menu. Bigger than a
                  section heading and set off by a rule either side of it, so a
                  long scroll cannot be mistaken for one continuous list. */}
              <header id={group.id} className="scroll-mt-16 text-center">
                <div className="mx-auto flex max-w-[34rem] items-center gap-5 md:gap-7">
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-foreground/20"
                  />
                  <h2 className="display-tight text-[clamp(2rem,8vw,3.1rem)] leading-[1.1]">
                    {group.label}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-foreground/20"
                  />
                </div>

                {group.menu.note ? (
                  <p className="mx-auto mt-7 max-w-[38rem] text-[0.82rem] leading-[1.9] text-pretty text-foreground/55">
                    {group.menu.note}
                  </p>
                ) : null}
              </header>

              {group.menu.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-16 pt-20 md:pt-28"
                >
                  <h3 className="display-tight text-center text-[1.75rem] leading-[1.25] md:text-[2.35rem]">
                    {section.title}
                  </h3>

                  {section.note ? (
                    <p className="mx-auto mt-4 max-w-[34rem] text-center text-[0.78rem] leading-[1.8] text-foreground/55">
                      {section.note}
                    </p>
                  ) : null}

                  <ul className="mt-12 grid gap-x-14 gap-y-7 md:mt-16 md:grid-cols-2 lg:gap-x-20">
                    {section.items.map((item) => (
                      <Row
                        key={item.name}
                        item={item}
                        currency={group.menu.currency}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
