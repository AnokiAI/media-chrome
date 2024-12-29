export const MediaClipUIProps = {
	MEDIA_CLIP_START_TIME: 'mediaClipStartTime',
  MEDIA_CLIP_END_TIME : 'mediaClipEndTime',
} as const;

export type MediaClipUIProps = typeof MediaClipUIProps;

type Entries<T> = { [k in keyof T]: [k, T[k]] }[keyof T][];

type LowercaseValues<T extends Record<any, string>> = {
  [k in keyof T]: Lowercase<T[k]>;
};

type Writeable<T> = {
  -readonly [k in keyof T]: T[k];
};

type MediaClipUIPropsEntries = Entries<MediaClipUIProps>;
const MediaClipUIPropsEntries: MediaClipUIPropsEntries = Object.entries(
  MediaClipUIProps
) as MediaClipUIPropsEntries;

export type MediaClipUIAttributes = LowercaseValues<MediaClipUIProps>;
export const MediaClipUIAttributes = MediaClipUIPropsEntries.reduce(
  (dictObj, [key, propName]) => {
    // @ts-ignore
    dictObj[key] = propName.toLowerCase();
    return dictObj;
  },
  {} as Partial<Writeable<MediaClipUIAttributes>>
) as MediaClipUIAttributes;
